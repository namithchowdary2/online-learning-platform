from django.urls import path
from .views import review_list, review_detail
urlpatterns = [
    path('<int:id>/',  review_detail),
    path('',           review_list),
]