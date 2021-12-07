from django.shortcuts import render, redirect
from .forms import ActuatorForm, RegisterForm
import KevinModule as kv
from json import dumps

# Create your views here.

def Home(request):
    dataActuatorJson = []
    dataActuator = {}
    if request.method == 'POST':
        form = ActuatorForm(request.POST)
        if form.is_valid():
            form.save()
            values = list(form.cleaned_data.values())
            # Actuator call 
            actuator = kv.Actuator(*values[0:11])
            dataActuator['dataXYOption'] = actuator.SearchPosition(list(cleanLim(values[11])), list(cleanLim(values[12])), values[13], list(cleanLim(values[14])), list(cleanLim(values[15])), values[16])
            dataActuator['mapData'] = actuator.Mapped()
            dataActuator['dataEfficiency'] = actuator.Efficiency(0.3)
            dataActuator['dataSearch'] = actuator.SearchResult()

    else:
        form = ActuatorForm()   

    dataActuatorJson.append(dumps(dataActuator))
    context = {'form': form, 'data': dataActuatorJson}
    return render(request, 'main/home.html', context)

def Register(request):

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            print(request.POST)
            form.save()
            return redirect('')
    else:
        form = RegisterForm()

    context = {'form': form}
    return render(request, 'main/register.html', context)

def cleanLim(lim):
    character = ["[", "]"]
    for char in character:
        lim = lim.strip(char)
    return map(float, lim.split(","))

# 0.278, 10000.0, 0.45, 0.520, 135.0, -1, 0.4, -4561.65, 0.1, 16, 0.01
# [-0.5, -0.05], [-1.5, -0.1], 0.01 , [0.2, 0.5], [0.062, 0.062], 0.01
