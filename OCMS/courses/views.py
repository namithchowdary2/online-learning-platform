from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated


def get_all(queryset):
    paginator = PageNumberPagination()
    paginator.page_size = 2
    return paginator, queryset


@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def category_list(request):
    if request.method == 'GET':
        data = Category.objects.all()
        paginator = PageNumberPagination()
        paginator.page_size = 2
        paginated = paginator.paginate_queryset(data, request)
        return paginator.get_paginated_response(CategorySerializer(paginated, many=True).data)
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@authentication_classes([])
@permission_classes([AllowAny])
def category_detail(request, id):
    try:
        obj = Category.objects.get(id=id)
    except:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'GET':
        return Response(CategorySerializer(obj).data)
    if request.method in ['PUT', 'PATCH']:
        serializer = CategorySerializer(obj, data=request.data, partial=(request.method=='PATCH'))
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
def course_list(request):
    if request.method == 'GET':
        data = Course.objects.all()
        paginator = PageNumberPagination()
        paginator.page_size = 2
        paginated = paginator.paginate_queryset(data, request)
        return paginator.get_paginated_response(CourseSerializer(paginated, many=True).data)
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@authentication_classes([])
@permission_classes([AllowAny])
def course_detail(request, id):
    try:
        obj = Course.objects.get(id=id)
    except:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'GET':
        return Response(CourseSerializer(obj).data)
    if request.method in ['PUT', 'PATCH']:
        serializer = CourseSerializer(obj, data=request.data, partial=(request.method=='PATCH'))
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
def module_list(request):
    if request.method == 'GET':
        data = Module.objects.all()
        paginator = PageNumberPagination()
        paginator.page_size = 2
        paginated = paginator.paginate_queryset(data, request)
        return paginator.get_paginated_response(ModuleSerializer(paginated, many=True).data)
    serializer = ModuleSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@authentication_classes([])
@permission_classes([AllowAny])
def module_detail(request, id):
    try:
        obj = Module.objects.get(id=id)
    except:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'GET':
        return Response(ModuleSerializer(obj).data)
    if request.method in ['PUT', 'PATCH']:
        serializer = ModuleSerializer(obj, data=request.data, partial=(request.method=='PATCH'))
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
def lecture_list(request):
    if request.method == 'GET':
        data = Lecture.objects.all()
        paginator = PageNumberPagination()
        paginator.page_size = 2
        paginated = paginator.paginate_queryset(data, request)
        return paginator.get_paginated_response(LectureSerializer(paginated, many=True).data)
    serializer = LectureSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@authentication_classes([])
@permission_classes([AllowAny])
def lecture_detail(request, id):
    try:
        obj = Lecture.objects.get(id=id)
    except:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'GET':
        return Response(LectureSerializer(obj).data)
    if request.method in ['PUT', 'PATCH']:
        serializer = LectureSerializer(obj, data=request.data, partial=(request.method=='PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=204)