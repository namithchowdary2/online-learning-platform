from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def enrollment_list(request):
    if request.method == 'GET':
        data = Enrollment.objects.all().order_by('-created_at')
        paginator = PageNumberPagination()
        paginator.page_size = 2
        paginated = paginator.paginate_queryset(data, request)
        return paginator.get_paginated_response(EnrollmentSerializer(paginated, many=True).data)
    serializer = EnrollmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@authentication_classes([])
@permission_classes([AllowAny])
def enrollment_detail(request, id):
    try:
        obj = Enrollment.objects.get(id=id)
    except:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'GET':
        return Response(EnrollmentSerializer(obj).data)
    if request.method in ['PUT', 'PATCH']:
        serializer = EnrollmentSerializer(obj, data=request.data, partial=(request.method=='PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=204)

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def lectureprogress_list(request):
    if request.method == 'GET':
        data = LectureProgress.objects.all()
        paginator = PageNumberPagination()
        paginator.page_size = 2
        paginated = paginator.paginate_queryset(data, request)
        return paginator.get_paginated_response(LectureProgressSerializer(paginated, many=True).data)
    serializer = LectureProgressSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@authentication_classes([])
@permission_classes([AllowAny])
def lectureprogress_detail(request, id):
    try:
        obj = LectureProgress.objects.get(id=id)
    except:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'GET':
        return Response(LectureProgressSerializer(obj).data)
    if request.method in ['PUT', 'PATCH']:
        serializer = LectureProgressSerializer(obj, data=request.data, partial=(request.method=='PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=204)