from django.urls import path
from .views import login_view, register_view, user_list, user_detail
urlpatterns = [
    path('login/',           login_view),       
    path('register/',        register_view),    
    path('users/',           user_list),        
    path('users/<int:id>/',  user_detail),      
]