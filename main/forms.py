from django import forms

class ActuatorForms(forms.Form):
    height = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'H', 'class': 'constructor-inputs'}), initial=0.278)
    force = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'F', 'class': 'constructor-inputs'}), initial=10000.0)
    stroke = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'L', 'class': 'constructor-inputs'}), initial=0.45)
    minLen = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'Min length', 'class': 'constructor-inputs'}), initial=0.520)
    angleSimul = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'Max Angle', 'class': 'constructor-inputs'}), initial=135)
    direction = forms.IntegerField(widget=forms.NumberInput(attrs={ 'placeholder': 'Direction', 'class': 'constructor-inputs'}), initial=-1)
    airLoad = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'Air Load', 'class': 'constructor-inputs'}), initial=0.4)
    weight = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'Weight', 'class': 'constructor-inputs'}), initial=-4561)
    step = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'Step', 'class': 'constructor-inputs'}), initial=0.1)
    numGraph = forms.IntegerField(widget=forms.NumberInput(attrs={ 'placeholder': 'Number of Graph', 'class': 'constructor-inputs'}), initial=16)
    tol = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'Tolerance', 'class': 'search-inputs'}), initial=0.01)
    limXA1 = forms.CharField(widget=forms.TextInput(attrs={ 'placeholder': 'limXA1', 'class': 'search-inputs'}), initial=[-0.5, -0.05])
    limYA1 = forms.CharField(widget=forms.TextInput(attrs={ 'placeholder': 'limYA1', 'class': 'search-inputs'}), initial=[-1.5, -0.1])
    stepA1 = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'StepA1', 'class': 'search-inputs'}), initial=0.01)
    limXA2 = forms.CharField(widget=forms.TextInput(attrs={ 'placeholder': 'limXA2', 'class': 'search-inputs'}), initial=[0.2, 0.5])
    limYA2 = forms.CharField(widget=forms.TextInput(attrs={ 'placeholder': 'limYA2', 'class': 'search-inputs'}), initial=[0.062, 0.062])
    stepA2 = forms.FloatField(widget=forms.NumberInput(attrs={ 'placeholder': 'StepA2', 'class': 'search-inputs'}), initial=0.01)


