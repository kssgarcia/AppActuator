from django.shortcuts import render, redirect
from .models import ActuatorModel
from .forms import ActuatorForm 

from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView, DeleteView, FormView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.urls import reverse_lazy
import KevinModule as kv
from json import dumps

# Create your views here.

class Login(LoginView):
    template_name = 'main/login.html'
    fields = '__all__'
    redirect_authentificated_user = True

    def get_success_url(self):
        return reverse_lazy('web-home')

class Register(FormView):
    template_name = 'main/register.html'
    form_class = UserCreationForm
    redirect_authentificated_user = True
    success_url = reverse_lazy('web-home')
    def form_valid(self, form):
        user = form.save()
        if user is not None:
            login(self.request, user)
        return super(Register, self).form_valid(form)

    def get(self, *args,**kwargs):
        if self.request.user.is_authenticated:
            return redirect('web-home')
        return super(Register, self).get(*args, **kwargs)

# Home Page
class HomeList(ListView):
    model = ActuatorModel
    template_name = 'main/homeList.html'
    context_object_name = 'actuatorProfile'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs) 
        context['actuatorProfile'] = context['actuatorProfile'].filter(user=self.request.user)
        return context

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
    fields = ['title', 'height', 'force', 'stroke', 'minLen', 'angleSimul', 'direction', 'airLoad', 'weight', 'step', 'numGraph', 'tol', 'limXA1', 'limYA1', 'stepA1', 'limXA2', 'limYA2', 'stepA2']
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
        return context
    
    def cleanLim(self, lim):
        character = ["[", "]"]
        for char in character:
            lim = lim.strip(char)
        return map(float, lim.split(","))
