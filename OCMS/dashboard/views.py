from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from accounts.models import User
from courses.models import Course, Category
from enrollments.models import Enrollment
from reviews.models import Review
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def analytics(request):
    data = {
        "total_users": User.objects.count(),
        "total_courses": Course.objects.count(),
        "total_categories": Category.objects.count(),
        "total_enrollments": Enrollment.objects.count(),
        "total_reviews": Review.objects.count(),
    }
    return Response(data)