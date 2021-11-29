from django.shortcuts import render, redirect
from .forms import ActuatorForms 
import KevinModule as kv

# Create your views here.

def Home(request):
    if request.method == 'POST':
        form = ActuatorForms(request.POST)
        if form.is_valid():
            print("The forms send correctly")
            print(form.cleaned_data.values())
            actuator = kv.Actuator(*form.cleaned_data.values())
            print(dir(actuator))

    else:
        form = ActuatorForms()   
    context = {'form': form}
    return render(request, 'main/home.html', context)


# 0.278, 10000.0, 0.45, 0.520, 135.0, -1, 0.4, -4561.65, 0.1, 16, 0.01
# [-0.5, -0.05], [-1.5, -0.1], 0.01 , [0.2, 0.5], [0.062, 0.062], 0.01
