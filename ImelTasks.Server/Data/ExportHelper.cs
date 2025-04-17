using System.IO;
using System.Collections.Generic;
using System.Linq;
using OfficeOpenXml; 
using iText.Kernel.Pdf; 
using iText.Layout;
using iText.Layout.Element;

namespace ImelTasks.Server.Data
{
    public static class ExportHelper
    {
        public static byte[] GenerateExcelContent<T>(List<T> data)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial; 

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Users");
            

            var properties = typeof(T).GetProperties();
            for (int i = 0; i < properties.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = properties[i].Name;
                worksheet.Cells[1, i + 1].Style.Font.Bold = true;
            }

            for (int i = 0; i < data.Count; i++)
            {
                for (int j = 0; j < properties.Length; j++)
                {
                    worksheet.Cells[i + 2, j + 1].Value = properties[j].GetValue(data[i])?.ToString();
                }
            }

            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

            return package.GetAsByteArray();
        }

        public static byte[] GeneratePdfContent<T>(List<T> data)
        {
            using var memoryStream = new MemoryStream();
            var writer = new PdfWriter(memoryStream);
            var pdf = new PdfDocument(writer);
            var document = new Document(pdf);

            document.Add(new Paragraph("User Export"));
            document.Add(new Paragraph(" "));

            var properties = typeof(T).GetProperties();
            var table = new Table(properties.Length);

            foreach (var prop in properties)
            {
                table.AddHeaderCell(prop.Name);
            }

            foreach (var item in data)
            {
                foreach (var prop in properties)
                {
                    table.AddCell(prop.GetValue(item)?.ToString() ?? string.Empty);
                }
            }

            document.Add(table);
            document.Close();

            return memoryStream.ToArray();
        }
    }
}