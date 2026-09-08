import api from "./api";

import { getExpenses } from "./expenseService";
import { getIncomes } from "./incomeService";

/* =========================================================
   GET REPORT DATA
========================================================= */

export const getReportData = async () => {
    const [
        expensesResponse,
        incomesResponse,
    ] = await Promise.all([
        getExpenses(),
        getIncomes(),
    ]);

    return {
        expenses: expensesResponse.data,
        incomes: incomesResponse.data,
    };
};


/* =========================================================
   DOWNLOAD MONTH-WISE EXPENSE REPORT
   Supported formats:
   - PDF
   - CSV
========================================================= */

export const downloadExpenseReport = async (
    month,
    year,
    format
) => {

    /* -----------------------------------------------------
       Validate month and year
    ----------------------------------------------------- */

    if (!month || !year) {
        throw new Error(
            "Month and year are required."
        );
    }


    /* -----------------------------------------------------
       Validate report format
    ----------------------------------------------------- */

    const selectedFormat =
        String(format).toLowerCase();

    if (
        selectedFormat !== "pdf" &&
        selectedFormat !== "csv"
    ) {
        throw new Error(
            "Report format must be PDF or CSV."
        );
    }


    /* -----------------------------------------------------
       Request report from Django
    ----------------------------------------------------- */

    const response = await api.get(
        "/reports/export/",
        {
            params: {
                month: Number(month),
                year: Number(year),
                format: selectedFormat,
            },

            /*
             * Very important:
             * Django returns a PDF/CSV file,
             * not JSON.
             */
            responseType: "blob",
        }
    );


    /* -----------------------------------------------------
       Determine filename
    ----------------------------------------------------- */

    let filename =
        `BudgetBuddy_Expenses_${year}.${selectedFormat}`;


    const contentDisposition =
        response.headers["content-disposition"];


    if (contentDisposition) {

        const match =
            contentDisposition.match(
                /filename="?([^"]+)"?/i
            );

        if (match?.[1]) {
            filename = match[1];
        }
    }


    /* -----------------------------------------------------
       Create browser Blob
    ----------------------------------------------------- */

    const blob = new Blob(
        [response.data],
        {
            type:
                selectedFormat === "pdf"
                    ? "application/pdf"
                    : "text/csv;charset=utf-8",
        }
    );


    /* -----------------------------------------------------
       Trigger browser download
    ----------------------------------------------------- */

    const downloadUrl =
        window.URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = downloadUrl;
    link.download = filename;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    /* -----------------------------------------------------
       Cleanup
    ----------------------------------------------------- */

    window.URL.revokeObjectURL(
        downloadUrl
    );


    return true;
};