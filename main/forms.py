from django import forms

class ActuatorForms(forms.Form):
    height = forms.FloatField(label="H")
    force = forms.FloatField(label="F")
    stroke = forms.FloatField(label="L")
    minLen = forms.FloatField(label="ml")
    angleSimul = forms.FloatField(label="MaxAngle")
    direction = forms.FloatField(label="Direction")
    airLoad = forms.FloatField(label="air Load")
    weight = forms.FloatField(label="weight")
    step = forms.FloatField(label="step")
    numGraph = forms.FloatField(label="numGraph")
    tol = forms.FloatField(label="Tol")

