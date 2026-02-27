from django.urls import path
from .views import (
    category_list, category_detail,
    course_list, course_detail,
    module_list, module_detail,
    lecture_list, lecture_detail,
)
urlpatterns = [
    path('categories/',           category_list),
    path('categories/<int:id>/',  category_detail),
    path('modules/',              module_list),
    path('modules/<int:id>/',     module_detail),
    path('lectures/',             lecture_list),
    path('lectures/<int:id>/',    lecture_detail),
    path('<int:id>/',             course_detail),
    path('',                      course_list),
]