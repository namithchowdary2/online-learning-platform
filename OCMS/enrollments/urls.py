from django.urls import path
from .views import (
    enrollment_list, enrollment_detail,
    lectureprogress_list, lectureprogress_detail,
)
urlpatterns = [
    path('progress/',           lectureprogress_list),
    path('progress/<int:id>/',  lectureprogress_detail),
    path('<int:id>/',           enrollment_detail),
    path('',                    enrollment_list),
]