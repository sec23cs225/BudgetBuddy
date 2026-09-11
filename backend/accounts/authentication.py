from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authenticate users using the JWT access token stored
    in the BudgetBuddy HttpOnly cookie.
    """

    def authenticate(self, request):

        # ----------------------------------------------------
        # GET ACCESS TOKEN FROM COOKIE
        # ----------------------------------------------------

        raw_token = request.COOKIES.get(
            "budgetbuddy_access"
        )

        # ----------------------------------------------------
        # NO ACCESS COOKIE
        # ----------------------------------------------------

        if not raw_token:
            return None

        # ----------------------------------------------------
        # VALIDATE ACCESS TOKEN
        # ----------------------------------------------------

        validated_token = self.get_validated_token(
            raw_token
        )

        # ----------------------------------------------------
        # GET AUTHENTICATED USER
        # ----------------------------------------------------

        user = self.get_user(
            validated_token
        )

        # ----------------------------------------------------
        # RETURN AUTHENTICATION RESULT
        # ----------------------------------------------------

        return (
            user,
            validated_token,
        )