from django.shortcuts import render
from rest_framework.views import APIView


# Create your views here.
class TestView(APIView):
    def get(self, request):
        return render( request, 'test.html', {'name': 'david'} )