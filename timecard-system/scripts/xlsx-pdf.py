import sys
import win32com.client

def export(excel_path, pdf_path):
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = False

    try:
        workbook = excel.Workbooks.Open(excel_path)

        workbook.ExportAsFixedFormat(0, pdf_path)

        print(f"Exported PDF to {pdf_path}")
    except Exception as e:
        print(f"Error exporting PDF: {e}")
    finally:
        workbook.Close(False)
        excel.Quit()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python xlsx-pdf.py <excel_path> <pdf_path>")
        sys.exit(1)

    excel_path = sys.argv[1]
    pdf_path = sys.argv[2]

    export(excel_path, pdf_path)