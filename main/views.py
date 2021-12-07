from django.shortcuts import render, redirect
from .models import ActuatorModel
from .forms import ActuatorForm 

from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView, DeleteView, FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
import KevinModule as kv
from json import dumps

# Create your views here.


class Login(LoginView):
    template_name = 'main/login.html'
    field = '__all__'
    redirect_authentificated_user = True
    context = {'form': field}

    def get_success_url(self):
        return reverse_lazy('web-home')


def Register(request):
    return render(request, 'main/register.html')

# Home Page
class HomeList(LoginRequiredMixin, ListView):
    model = ActuatorModel
    template_name = 'main/homeList.html'
    context_object_name = 'actuatorProfile'

class HomeDetail(LoginRequiredMixin, DetailView):
    model = ActuatorModel
    template_name = 'main/homeDetail.html'
    context_object_name = 'actuatorProfile'

class HomeCreate(LoginRequiredMixin, CreateView):
    template_name =  'main/homeCreate.html'
    model = ActuatorModel
    fields = ['title', 'height', 'force', 'stroke', 'minLen', 'angleSimul', 'direction', 'airLoad', 'weight', 'step', 'numGraph', 'tol', 'limXA1', 'limYA1', 'stepA1', 'limXA2', 'limYA2', 'stepA2']
    success_url = reverse_lazy('HomeDetail')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super(HomeCreate, self).form_valid(form)

class HomeDelete(LoginRequiredMixin, DeleteView):
    template_name =  'main/homeCreate.html'
    model = ActuatorModel
    success_url = reverse_lazy('HomeDetail')

    def get_queryset(self):
        owner = self.request.user

class HomeUpdate(LoginRequiredMixin, UpdateView):
    template_name =  'main/homeUpdate.html'
    model = ActuatorModel
    fields = '__all__'
    # Variables data POST
    dataActuator = {}
    dataActuatorJson = []

    def form_valid(self, form):
        values = list(form.cleaned_data.values())
        # Getting inputs and assigning data   
        actuator = kv.Actuator(*values[0:11])
        self.dataActuator['dataXYOption'] = actuator.SearchPosition(list(self.cleanLim(values[11])), list(self.cleanLim(values[12])), values[13], list(self.cleanLim(values[14])), list(self.cleanLim(values[15])), values[16])
        self.dataActuator['mapData'] = actuator.Mapped()
        self.dataActuator['dataEfficiency'] = actuator.Efficiency(0.3)
        self.dataActuator['dataSearch'] = actuator.SearchResult()

    def get(self, request, *args, **kwargs):
        self.dataActuatorJson.append(dumps(self.dataActuator))
        self.context = {'form': request, 'data': self.dataActuatorJson}
        return render(request, 'main/home.html', self.context)

    def cleanLim(self, lim):
        character = ["[", "]"]
        for char in character:
            lim = lim.strip(char)
        return map(float, lim.split(","))


# 0.278, 10000.0, 0.45, 0.520, 135.0, -1, 0.4, -4561.65, 0.1, 16, 0.01
# [-0.5, -0.05], [-1.5, -0.1], 0.01 , [0.2, 0.5], [0.062, 0.062], 0.01
