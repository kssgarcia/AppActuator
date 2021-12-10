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

# Details Page
class HomeDetail(LoginRequiredMixin, DetailView):
    model = ActuatorModel
    template_name = 'main/homeDetail.html'
    context_object_name = 'actuatorProfile'

# Create profile Page
class HomeCreate(LoginRequiredMixin, CreateView):
    template_name =  'main/homeCreate.html'
    model = ActuatorModel
    form_class = ActuatorForm
    success_url = reverse_lazy('web-home')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super(HomeCreate, self).form_valid(form)

# Updata profile Page
class HomeUpdate(LoginRequiredMixin, UpdateView):
    template_name =  'main/homeCreate.html'
    model = ActuatorModel
    fields = '__all__'
    success_url = reverse_lazy('web-home')

# Delete profile Page
class HomeDelete(LoginRequiredMixin, DeleteView):
    template_name =  'main/homeDelete.html'
    model = ActuatorModel
    context_object_name = 'profile'
    success_url = reverse_lazy('web-home')

# Updata profile Page
class displayResult(LoginRequiredMixin, UpdateView):
    template_name =  'main/home.html'
    model = ActuatorModel
    form_class = ActuatorForm
    # Variables data POST
    dataActuator = {}
    dataActuatorJson = []

    def form_valid(self, form):
        values = list(form.cleaned_data.values())
        # Getting inputs and assigning data   
        actuator = kv.Actuator(*values[1:12])
        self.dataActuator['dataXYOption'] = actuator.SearchPosition(list(self.cleanLim(values[12])), list(self.cleanLim(values[13])), values[14], list(self.cleanLim(values[15])), list(self.cleanLim(values[16])), values[17])
        self.dataActuator['mapData'] = actuator.Mapped()
        self.dataActuator['dataEfficiency'] = actuator.Efficiency(0.3)
        self.dataActuator['dataSearch'] = actuator.SearchResult()
        self.dataActuatorJson = dumps(self.dataActuator)
        return super().get(form)

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(**kwargs)
        context['data'] = self.dataActuatorJson
        print(context)
        return context
    
    def cleanLim(self, lim):
        character = ["[", "]"]
        for char in character:
            lim = lim.strip(char)
        return map(float, lim.split(","))

#print(dir(displayResult))
# 0.278, 10000.0, 0.45, 0.520, 135.0, -1, 0.4, -4561.65, 0.1, 16, 0.01
# [-0.5, -0.05], [-1.5, -0.1], 0.01 ,<WSGIRequest: GET '/result/'> [0.2, 0.5], [0.062, 0.062], 0.01
