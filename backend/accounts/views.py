from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse


from google.auth.transport import requests
from google.oauth2 import id_token


from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response


from rest_framework_simplejwt.tokens import RefreshToken


from .serializers import RegisterSerializer


# ============================================================
# COOKIE HELPERS
# ============================================================

def set_auth_cookies(response, refresh):
    """
    Store BudgetBuddy JWT tokens in HttpOnly cookies.
    """

    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # --------------------------------------------------------
    # ACCESS TOKEN COOKIE
    # --------------------------------------------------------

    response.set_cookie(
        key=settings.AUTH_COOKIE_ACCESS,
        value=access_token,
        max_age=30 * 60,
        httponly=settings.AUTH_COOKIE_HTTP_ONLY,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/",
    )

    # --------------------------------------------------------
    # REFRESH TOKEN COOKIE
    # --------------------------------------------------------

    response.set_cookie(
        key=settings.AUTH_COOKIE_REFRESH,
        value=refresh_token,
        max_age=7 * 24 * 60 * 60,
        httponly=settings.AUTH_COOKIE_HTTP_ONLY,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/",
    )


def clear_auth_cookies(response):
    """
    Clear BudgetBuddy authentication cookies.
    """

    response.delete_cookie(
        key=settings.AUTH_COOKIE_ACCESS,
        path="/",
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )

    response.delete_cookie(
        key=settings.AUTH_COOKIE_REFRESH,
        path="/",
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


# ============================================================
# HOME
# ============================================================

def home(request):
    return JsonResponse({
        "message": "Welcome to BudgetBuddy Backend!"
    })


# ============================================================
# NORMAL REGISTRATION
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):

    serializer = RegisterSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            {
                "message":
                    "User registered successfully."
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# ============================================================
# NORMAL LOGIN
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):

    username = request.data.get("username")
    password = request.data.get("password")

    # --------------------------------------------------------
    # VALIDATE LOGIN DATA
    # --------------------------------------------------------

    if not username or not password:

        return Response(
            {
                "error":
                    "Username and password are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------------------------
    # AUTHENTICATE USER
    # --------------------------------------------------------

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:

        return Response(
            {
                "error":
                    "Invalid username or password."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # --------------------------------------------------------
    # CHECK ACTIVE STATUS
    # --------------------------------------------------------

    if not user.is_active:

        return Response(
            {
                "error":
                    "This account is inactive."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # --------------------------------------------------------
    # GENERATE JWT
    # --------------------------------------------------------

    refresh = RefreshToken.for_user(user)

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    response = Response(
        {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },

            "message": "Login successful.",
        },

        status=status.HTTP_200_OK,
    )

    # --------------------------------------------------------
    # STORE JWT IN HTTPONLY COOKIES
    # --------------------------------------------------------

    set_auth_cookies(
        response,
        refresh,
    )

    return response


# ============================================================
# GOOGLE LOGIN
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):

    credential = request.data.get(
        "credential"
    )

    # --------------------------------------------------------
    # CREDENTIAL CHECK
    # --------------------------------------------------------

    if not credential:

        return Response(
            {
                "error":
                    "Google credential is required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------------------------
    # GOOGLE CLIENT ID CHECK
    # --------------------------------------------------------

    google_client_id = getattr(
        settings,
        "GOOGLE_CLIENT_ID",
        "",
    )

    if not google_client_id:

        return Response(
            {
                "error": (
                    "Google authentication is "
                    "not configured on the server."
                )
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:

        # ----------------------------------------------------
        # VERIFY GOOGLE ID TOKEN
        # ----------------------------------------------------

        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            google_client_id,
        )

        # ----------------------------------------------------
        # VERIFY ISSUER
        # ----------------------------------------------------

        issuer = idinfo.get("iss")

        if issuer not in (
            "accounts.google.com",
            "https://accounts.google.com",
        ):

            return Response(
                {
                    "error":
                        "Invalid Google token issuer."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # GOOGLE ACCOUNT INFORMATION
        # ----------------------------------------------------

        email = idinfo.get("email")

        email_verified = idinfo.get(
            "email_verified",
            False,
        )

        if not email:

            return Response(
                {
                    "error": (
                        "Google account email "
                        "not available."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email_verified:

            return Response(
                {
                    "error": (
                        "Google account email "
                        "is not verified."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = email.strip().lower()

        # ----------------------------------------------------
        # FIND EXISTING BUDGETBUDDY USER
        # ----------------------------------------------------

        user = User.objects.filter(
            email__iexact=email
        ).first()

        # ----------------------------------------------------
        # CREATE USER IF NECESSARY
        # ----------------------------------------------------

        if not user:

            username = email.split("@")[0]

            original_username = username
            counter = 1

            # Make sure username is unique
            while User.objects.filter(
                username=username
            ).exists():

                username = (
                    f"{original_username}{counter}"
                )

                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
            )

        # ----------------------------------------------------
        # CHECK ACTIVE STATUS
        # ----------------------------------------------------

        if not user.is_active:

            return Response(
                {
                    "error":
                        "This account is inactive."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ----------------------------------------------------
        # GENERATE JWT
        # ----------------------------------------------------

        refresh = RefreshToken.for_user(user)

        # ----------------------------------------------------
        # SUCCESS RESPONSE
        # ----------------------------------------------------

        response = Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },

                "message":
                    "Google login successful.",
            },

            status=status.HTTP_200_OK,
        )

        # ----------------------------------------------------
        # STORE JWT IN HTTPONLY COOKIES
        # ----------------------------------------------------

        set_auth_cookies(
            response,
            refresh,
        )

        return response

    # --------------------------------------------------------
    # INVALID GOOGLE TOKEN
    # --------------------------------------------------------

    except (ValueError, Exception) as error:

        print(
            "GOOGLE TOKEN VERIFICATION ERROR:",
            repr(error),
        )

        return Response(
            {
                "error":
                    "Invalid Google credential.",

                "details":
                    str(error),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# CURRENT USER / SESSION CHECK
# ============================================================

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):

    """
    Return or update the currently authenticated BudgetBuddy user profile.

    This endpoint is used by ProtectedRoute to verify sessions and
    by Settings to update the user's registered email address.
    """

    user = request.user

    if request.method == "PATCH":
        new_email = request.data.get("email")
        if new_email is not None:
            new_email = new_email.strip().lower()
            if new_email and User.objects.filter(email__iexact=new_email).exclude(id=user.id).exists():
                return Response(
                    {"error": "This email address is already in use by another account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.email = new_email
            user.save(update_fields=["email"])

        new_username = request.data.get("username")
        if new_username:
            new_username = new_username.strip()
            if User.objects.filter(username__iexact=new_username).exclude(id=user.id).exists():
                return Response(
                    {"error": "This username is already taken."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.username = new_username
            user.save(update_fields=["username"])

    return Response(
        {
            "authenticated": True,

            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# REFRESH ACCESS TOKEN
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):

    refresh_token_value = request.COOKIES.get(
        settings.AUTH_COOKIE_REFRESH
    )

    # --------------------------------------------------------
    # CHECK REFRESH COOKIE
    # --------------------------------------------------------

    if not refresh_token_value:

        return Response(
            {
                "error":
                    "Refresh token is missing."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:

        # ----------------------------------------------------
        # VALIDATE REFRESH TOKEN
        # ----------------------------------------------------

        refresh = RefreshToken(
            refresh_token_value
        )

        # ----------------------------------------------------
        # GENERATE NEW ACCESS TOKEN
        # ----------------------------------------------------

        access_token = str(
            refresh.access_token
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        response = Response(
            {
                "message":
                    "Access token refreshed."
            },
            status=status.HTTP_200_OK,
        )

        # ----------------------------------------------------
        # UPDATE ACCESS COOKIE
        # ----------------------------------------------------

        response.set_cookie(
            key=settings.AUTH_COOKIE_ACCESS,
            value=access_token,
            max_age=30 * 60,
            httponly=settings.AUTH_COOKIE_HTTP_ONLY,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
            path="/",
        )

        return response

    # --------------------------------------------------------
    # INVALID / EXPIRED REFRESH TOKEN
    # --------------------------------------------------------

    except Exception:

        response = Response(
            {
                "error":
                    "Invalid or expired refresh token."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

        clear_auth_cookies(response)

        return response


# ============================================================
# LOGOUT
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):

    response = Response(
        {
            "message":
                "Logout successful."
        },
        status=status.HTTP_200_OK,
    )

    # --------------------------------------------------------
    # CLEAR AUTHENTICATION COOKIES
    # --------------------------------------------------------

    clear_auth_cookies(response)

    return response