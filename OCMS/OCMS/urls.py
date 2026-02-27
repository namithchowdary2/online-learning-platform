from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from accounts.views  import login_view, register_view, user_list, user_detail
from courses.views   import (category_list, category_detail,
                              course_list,   course_detail,
                              module_list,   module_detail,
                              lecture_list,  lecture_detail)
from enrollments.views import (enrollment_list,     enrollment_detail,
                                lectureprogress_list, lectureprogress_detail)
from reviews.views   import review_list, review_detail
from dashboard.views import analytics
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/login/',            login_view),
    path('api/accounts/register/',         register_view),
    path('api/accounts/users/',            user_list),
    path('api/accounts/users/<int:id>/',   user_detail),
    path('api/categories/',                category_list),
    path('api/categories/<int:id>/',       category_detail),
    path('api/courses/',                   course_list),
    path('api/courses/<int:id>/',          course_detail),
    path('api/modules/',                   module_list),
    path('api/modules/<int:id>/',          module_detail),
    path('api/lectures/',                  lecture_list),
    path('api/lectures/<int:id>/',         lecture_detail),
    path('api/enrollments/',               enrollment_list),
    path('api/enrollments/<int:id>/',      enrollment_detail),
    path('api/progress/',                  lectureprogress_list),
    path('api/progress/<int:id>/',         lectureprogress_detail),
    path('api/reviews/',                   review_list),
    path('api/reviews/<int:id>/',          review_detail),
    path('api/analytics/',                 analytics),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)