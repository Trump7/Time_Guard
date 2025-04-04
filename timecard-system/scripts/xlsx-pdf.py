import sys
import win32com.client

def export(excel_path, pdf_path):
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = False

    try:
        workbook = excel.Workbooks.Open(excel_path)
        ws = workbook.Worksheets(1)

        #PageSetup
        ws.PageSetup.Orientation = 2
        ws.PageSetup.Zoom = 85
        ws.PageSetup.PaperSize = 1
        ws.PageSetup.PrintQuality = 300
        ws.PageSetup.FirstPageNumber = 1
        ws.PageSetup.TopMargin = excel.InchesToPoints(0.75)
        ws.PageSetup.BottomMargin = excel.InchesToPoints(0.75)
        ws.PageSetup.LeftMargin = excel.InchesToPoints(0.7)
        ws.PageSetup.RightMargin = excel.InchesToPoints(0.7)
        ws.PageSetup.HeaderMargin = excel.InchesToPoints(0.3)
        ws.PageSetup.FooterMargin = excel.InchesToPoints(0.3)
        ws.PageSetup.AlignMarginsHeaderFooter = True
        ws.PageSetup.ScaleWithDocHeaderFooter = True
        ws.PageSetup.PrintArea = "A1:K25"
        ws.PageSetup.PrintTitleRows = "$5:$5"
        ws.PageSetup.Order = 1

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