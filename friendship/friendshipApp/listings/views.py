# from django.shortcuts import render

# Create your views here.

from django.shortcuts import render, redirect
from .models import FriendRequest
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse

# @login_required
def send_friend_request(request, user_id):
    from_user = request.user
    to_user = User.objects.get(id=user_id)
    friend_request, created = FriendRequest.objects.get_or_create(
        from_user=from_user,
        to_user=to_user
    )
    return redirect('some_view_name')

# @login_required
def accept_friend_request(request, request_id):
    friend_request = FriendRequest.objects.get(id=request_id)
    if friend_request.to_user == request.user:
        friend_request.accepted = True
        friend_request.save()
    return redirect('some_view_name')

# @login_required
def decline_friend_request(request, request_id):
    friend_request = FriendRequest.objects.get(id=request_id)
    if friend_request.to_user == request.user:
        friend_request.delete()
    return redirect('some_view_name')

def hello(request):
    return HttpResponse('<h1>OUEOUEOUEOUEOUEOUE !</h1>')
