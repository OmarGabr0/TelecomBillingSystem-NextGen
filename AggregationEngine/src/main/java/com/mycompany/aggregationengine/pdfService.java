/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.aggregationengine;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.*;
import java.nio.charset.StandardCharsets;
/**
 *
 * @author mohamed
 */
public class pdfService {
  
    public String generate(InvoiceData data) {

        try {
            String html = loadTemplate();

           html = html.replace("{{customerId}}", String.valueOf(data.customer.customerId))
           .replace("{{customerName}}", String.valueOf(data.customer.name))
           .replace("{{email}}", data.customer.email)
           .replace("{{address}}", data.customer.address)
           .replace("{{contractId}}", String.valueOf(data.msisdn))
           .replace("{{ratePlan}}", data.ratePlanName)
           .replace("{{start}}", data.billing_start.toString())
           .replace("{{end}}", data.billing_end.toString())
           .replace("{{monthly}}", String.valueOf(data.monthly))
           .replace("{{recurring}}", String.valueOf(data.recurring))
           .replace("{{oneTime}}", String.valueOf(data.oneTime))
           .replace("{{ror}}", String.valueOf(data.ror))
           .replace("{{discount}}", String.valueOf(data.discount))
           .replace("{{subtotal}}", String.valueOf(data.subtotal))
           .replace("{{tax}}", String.valueOf(data.tax))
           .replace("{{total}}", String.valueOf(data.total));

            String path = buildPath(data);

            createFolder(data.msisdn);

            try (OutputStream os = new FileOutputStream(path)) {

                PdfRendererBuilder builder = new PdfRendererBuilder();
                builder.withHtmlContent(html, null);
                builder.toStream(os);
                builder.run();
            }

            return path;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    private String loadTemplate() throws IOException {
        InputStream is = getClass().getClassLoader()
                .getResourceAsStream("templates/invoice.html");

        return new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }

    private String buildPath(InvoiceData data) {
        return "invoices/" + data.msisdn + "/" +
                data.billing_start + "_" + data.billing_end + ".pdf";
    }

    private void createFolder(String msisdn) {
        File dir = new File("invoices/" + msisdn);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

}
