from django.shortcuts import render, redirect
from .forms import ActuatorForms
# Create your views here.

def Home(request):
    if request.method == 'POST':
        form = ActuatorForms(request.POST)
        if form.is_valid():
            print("The forms send correctly")
    else:
        form = ActuatorForms()   
    context = {'form': form}
    return render(request, 'main/home.html', context)
