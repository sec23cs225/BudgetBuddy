import csv
import io
from decimal import Decimal

from django.http import HttpResponse, JsonResponse

from rest_framework_simplejwt.authentication import JWTAuthentication

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from expenses.models import Expense


MONTH_NAMES = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
}


def export_expense_report(request):

    # =====================================================
    # METHOD
    # =====================================================

    if request.method != "GET":
        return JsonResponse(
            {
                "detail": "Only GET requests are allowed."
            },
            status=405,
        )


    # =====================================================
    # JWT AUTHENTICATION
    # =====================================================

    try:

        authentication = JWTAuthentication()

        result = authentication.authenticate(request)

        if result is None:
            return JsonResponse(
                {
                    "detail": "Authentication credentials were not provided."
                },
                status=401,
            )

        user, validated_token = result

    except Exception as error:

        print(
            "REPORT AUTHENTICATION ERROR:",
            repr(error),
        )

        return JsonResponse(
            {
                "detail": "Authentication failed."
            },
            status=401,
        )


    # =====================================================
    # PARAMETERS
    # =====================================================

    month = request.GET.get("month")
    year = request.GET.get("year")
    report_format = (
        request.GET.get("format", "pdf")
        .strip()
        .lower()
    )


    # =====================================================
    # VALIDATE MONTH / YEAR
    # =====================================================

    try:

        month = int(month)
        year = int(year)

    except (TypeError, ValueError):

        return JsonResponse(
            {
                "detail": "Invalid month or year."
            },
            status=400,
        )


    if month < 1 or month > 12:

        return JsonResponse(
            {
                "detail": "Month must be between 1 and 12."
            },
            status=400,
        )


    if year < 2000 or year > 2100:

        return JsonResponse(
            {
                "detail": "Invalid year."
            },
            status=400,
        )


    # =====================================================
    # VALIDATE FORMAT
    # =====================================================

    if report_format not in ("pdf", "csv"):

        return JsonResponse(
            {
                "detail": "Invalid format. Use pdf or csv."
            },
            status=400,
        )


    # =====================================================
    # GET CURRENT USER'S EXPENSES
    # =====================================================

    expenses = (
        Expense.objects
        .filter(
            user=user,
            expense_date__year=year,
            expense_date__month=month,
        )
        .order_by(
            "expense_date",
            "id",
        )
    )


    month_name = MONTH_NAMES[month]


    # =====================================================
    # TOTAL EXPENSE
    # =====================================================

    total_expense = sum(
        (
            Decimal(str(expense.amount))
            for expense in expenses
            if expense.amount is not None
        ),
        Decimal("0"),
    )


    # =====================================================
    # CSV EXPORT
    # =====================================================

    if report_format == "csv":

        response = HttpResponse(
            content_type="text/csv; charset=utf-8"
        )

        filename = (
            f"BudgetBuddy_Expenses_"
            f"{month_name}_{year}.csv"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="{filename}"'
        )

        writer = csv.writer(response)

        writer.writerow([
            "BudgetBuddy Monthly Expense Report"
        ])

        writer.writerow([
            f"{month_name} {year}"
        ])

        writer.writerow([
            "User",
            user.get_username(),
        ])

        writer.writerow([])

        writer.writerow([
            "Date",
            "Title",
            "Category",
            "Payment Method",
            "Amount",
            "Notes",
        ])

        for expense in expenses:

            writer.writerow([
                expense.expense_date,
                expense.title,
                expense.category,
                expense.payment_method,
                f"{Decimal(str(expense.amount)):.2f}",
                expense.notes or "",
            ])

        writer.writerow([])

        writer.writerow([
            "Total Transactions",
            expenses.count(),
        ])

        writer.writerow([
            "Total Expense",
            f"{total_expense:.2f}",
        ])

        return response


    # =====================================================
    # PDF EXPORT
    # =====================================================

    buffer = io.BytesIO()

    filename = (
        f"BudgetBuddy_Expenses_"
        f"{month_name}_{year}.pdf"
    )


    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=40,
        bottomMargin=40,
        title=f"BudgetBuddy Expenses - {month_name} {year}",
        author="BudgetBuddy",
    )


    styles = getSampleStyleSheet()


    title_style = ParagraphStyle(
        "BudgetBuddyTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=8,
    )


    subtitle_style = ParagraphStyle(
        "BudgetBuddySubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=20,
    )


    heading_style = ParagraphStyle(
        "BudgetBuddyHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=10,
        spaceAfter=8,
    )


    story = []


    # =====================================================
    # HEADER
    # =====================================================

    story.append(
        Paragraph(
            "BudgetBuddy",
            title_style,
        )
    )


    story.append(
        Paragraph(
            f"Monthly Expense Report — "
            f"{month_name} {year}",
            subtitle_style,
        )
    )


    # =====================================================
    # ACCOUNT INFORMATION
    # =====================================================

    account_table = Table(
        [
            [
                "Account",
                user.get_username(),
            ],
            [
                "Report Period",
                f"{month_name} {year}",
            ],
        ],
        colWidths=[
            130,
            390,
        ],
    )


    account_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (0, -1),
                colors.HexColor("#e2e8f0"),
            ),
            (
                "FONTNAME",
                (0, 0),
                (0, -1),
                "Helvetica-Bold",
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.4,
                colors.HexColor("#cbd5e1"),
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                7,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                7,
            ),
        ])
    )


    story.append(account_table)

    story.append(
        Spacer(1, 18)
    )


    # =====================================================
    # SUMMARY
    # =====================================================

    story.append(
        Paragraph(
            "Expense Summary",
            heading_style,
        )
    )


    summary_table = Table(
        [
            [
                "Transactions",
                "Total Expense",
            ],
            [
                str(expenses.count()),
                f"Rs. {total_expense:,.2f}",
            ],
        ],
        colWidths=[
            250,
            250,
        ],
    )


    summary_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#0f172a"),
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white,
            ),
            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold",
            ),
            (
                "ALIGN",
                (0, 0),
                (-1, -1),
                "CENTER",
            ),
            (
                "BACKGROUND",
                (0, 1),
                (-1, 1),
                colors.HexColor("#f8fafc"),
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#cbd5e1"),
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                10,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                10,
            ),
        ])
    )


    story.append(summary_table)

    story.append(
        Spacer(1, 20)
    )


    # =====================================================
    # TRANSACTIONS
    # =====================================================

    story.append(
        Paragraph(
            "Expense Transactions",
            heading_style,
        )
    )


    if expenses.exists():

        table_data = [
            [
                "Date",
                "Title",
                "Category",
                "Payment",
                "Amount",
            ]
        ]


        for expense in expenses:

            table_data.append([
                str(expense.expense_date),
                str(expense.title),
                str(expense.category),
                str(expense.payment_method),
                f"Rs. {Decimal(str(expense.amount)):,.2f}",
            ])


        expense_table = Table(
            table_data,
            colWidths=[
                70,
                145,
                90,
                80,
                80,
            ],
            repeatRows=1,
        )


        expense_table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#0f172a"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    colors.HexColor("#cbd5e1"),
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.white,
                        colors.HexColor("#f8fafc"),
                    ],
                ),
                (
                    "ALIGN",
                    (-1, 1),
                    (-1, -1),
                    "RIGHT",
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ])
        )


        story.append(expense_table)

    else:

        story.append(
            Paragraph(
                "No expenses recorded for this month.",
                styles["Normal"],
            )
        )


    # =====================================================
    # TOTAL
    # =====================================================

    story.append(
        Spacer(1, 18)
    )


    total_table = Table(
        [[
            "TOTAL MONTHLY EXPENSE",
            f"Rs. {total_expense:,.2f}",
        ]],
        colWidths=[
            385,
            80,
        ],
    )


    total_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, -1),
                colors.HexColor("#0f172a"),
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (-1, -1),
                colors.white,
            ),
            (
                "FONTNAME",
                (0, 0),
                (-1, -1),
                "Helvetica-Bold",
            ),
            (
                "ALIGN",
                (-1, 0),
                (-1, 0),
                "RIGHT",
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                10,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                10,
            ),
        ])
    )


    story.append(total_table)


    # =====================================================
    # BUILD PDF
    # =====================================================

    document.build(story)


    buffer.seek(0)

    pdf_data = buffer.getvalue()


    response = HttpResponse(
        pdf_data,
        content_type="application/pdf",
    )


    response["Content-Disposition"] = (
        f'attachment; filename="{filename}"'
    )


    response["Content-Length"] = str(
        len(pdf_data)
    )


    return response