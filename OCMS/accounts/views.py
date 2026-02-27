from .models import User
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.authentication import BasicAuthentication
import hashlib


def hash_pw(raw):
    return hashlib.sha256(raw.encode()).hexdigest()


# ── LOGIN ──────────────────────────────────────────────────────
@api_view(['POST'])
@authentication_classes([])        # no auth = no CSRF enforcement by DRF
@permission_classes([AllowAny])
def login_view(request):
    email    = (request.data.get('email') or '').strip().lower()
    password = (request.data.get('password') or '')
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=400)
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({'error': 'No account found with that email. Please register first.'}, status=401)
    if user.password == password or user.password == hash_pw(password):
        return Response({'success': True, 'user': UserSerializer(user).data})
    return Response({'error': 'Wrong password. Please try again.'}, status=401)


# ── REGISTER ───────────────────────────────────────────────────
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register_view(request):
    email = (request.data.get('email') or '').strip().lower()
    if not email:
        return Response({'error': 'Email is required'}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'An account with this email already exists. Please sign in.'}, status=400)
    data = request.data.copy()
    data['email'] = email
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'success': True, 'user': UserSerializer(user).data}, status=201)
    first_error = next(iter(serializer.errors.values()))[0]
    return Response({'error': str(first_error)}, status=400)


# ── USERS LIST / DETAIL ────────────────────────────────────────
@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all()
        paginator = PageNumberPagination()
        paginator.page_size = 2
        paginated = paginator.paginate_queryset(users, request)
        return paginator.get_paginated_response(UserSerializer(paginated, many=True).data)
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
@authentication_classes([])
@permission_classes([AllowAny])
def user_detail(request, id):
    try:
        user = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    if request.method == 'GET':
        return Response(UserSerializer(user).data)
    if request.method in ['PUT', 'PATCH']:
        serializer = UserSerializer(user, data=request.data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    if request.method == 'DELETE':
        user.delete()
        return Response(status=204)