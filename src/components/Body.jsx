import {
  Asterisk,
  CloudDrizzle,
  Download,
  Hash,
  House,
  Trash2,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { useRef, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import jsPDF from "jspdf";

const Body = () => {
  const invoiceRef = useRef();
  const [showPreview, setShowPreview] = useState(true);

  return (
    <Formik
      initialValues={{
        invoiceNum: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        BusinessName: "",
        BusinessEmail: "",
        BusinessPhone: "",
        BusinessAddress: "",
        ClientName: "",
        ClientPhone: "",
        ClientAddress: "",
        ClientEmail: "",
        TaxRate: 0,
        Notes: "",
        items: [{ description: "", qty: 1, rate: 0, amount: 0 }],
      }}
      validationSchema={yup.object({
        invoiceNum: yup.string().required("Required"),
        invoiceDate: yup.string().required("Required"),
        dueDate: yup.string().required("Required"),
        BusinessName: yup.string().required("Required"),
        BusinessEmail: yup.string().email("Invalid email").required("Required"),
        BusinessPhone: yup.string().required("Required"),
        BusinessAddress: yup.string().required("Required"),
        ClientName: yup.string().required("Required"),
        ClientEmail: yup.string().email("Invalid email").required("Required"),
        ClientPhone: yup.string().required("Required"),
        ClientAddress: yup.string().required("Required"),
        TaxRate: yup.number().min(0, "Must be positive").required("Required"),
        items: yup
          .array()
          .of(
            yup.object().shape({
              description: yup.string().required("Required"),
              qty: yup
                .number()
                .positive("Must be positive")
                .required("Required"),
              rate: yup
                .number()
                .min(0, "Must be positive")
                .required("Required"),
            }),
          )
          .min(1, "At least one item required"),
      })}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const pdf = new jsPDF("p", "mm", "a4");
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 15;
          let yPos = 20;

          // Calculate totals
          const subtotal = values.items.reduce(
            (sum, item) => sum + item.amount,
            0,
          );
          const taxAmount = (subtotal * values.TaxRate) / 100;
          const total = subtotal + taxAmount;

          // Header
          pdf.setFontSize(32);
          pdf.setFont("helvetica", "bold");
          pdf.text("INVOICE", margin, yPos);
          yPos += 10;

          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          pdf.text(`#${values.invoiceNum}`, margin, yPos);
          yPos += 3;

          // Blue line under header
          pdf.setDrawColor(37, 99, 235);
          pdf.setLineWidth(1);
          pdf.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 12;

          // From/To Section
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(107, 114, 128);
          pdf.text("FROM", margin, yPos);
          pdf.text("BILL TO", pageWidth / 2, yPos);
          yPos += 5;

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text(values.BusinessName, margin, yPos);
          pdf.text(values.ClientName, pageWidth / 2, yPos);
          yPos += 6;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(75, 85, 99);

          const businessLines = values.BusinessAddress.split("\n");
          businessLines.forEach((line) => {
            pdf.text(line, margin, yPos);
            yPos += 4;
          });

          yPos -= businessLines.length * 4;
          const clientLines = values.ClientAddress.split("\n");
          clientLines.forEach((line) => {
            pdf.text(line, pageWidth / 2, yPos);
            yPos += 4;
          });

          yPos = Math.max(
            yPos,
            20 +
              6 +
              5 +
              6 +
              Math.max(businessLines.length, clientLines.length) * 4,
          );

          pdf.text(values.BusinessEmail, margin, yPos);
          pdf.text(values.ClientEmail, pageWidth / 2, yPos);
          yPos += 4;

          pdf.text(values.BusinessPhone, margin, yPos);
          pdf.text(values.ClientPhone, pageWidth / 2, yPos);
          yPos += 10;

          // Dates
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 12, "F");

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(107, 114, 128);
          pdf.text("INVOICE DATE", margin + 5, yPos + 5);
          pdf.text("DUE DATE", pageWidth / 2, yPos + 5);

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text(values.invoiceDate, margin + 5, yPos + 9);
          pdf.text(values.dueDate, pageWidth / 2, yPos + 9);
          yPos += 18;

          // Items Table Header
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(55, 65, 81);
          pdf.text("DESCRIPTION", margin, yPos);
          pdf.text("QTY", pageWidth - margin - 70, yPos);
          pdf.text("RATE", pageWidth - margin - 50, yPos);
          pdf.text("AMOUNT", pageWidth - margin - 30, yPos, { align: "right" });
          yPos += 3;

          pdf.setDrawColor(209, 213, 219);
          pdf.setLineWidth(0.5);
          pdf.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 6;

          // Items
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(31, 41, 55);
          values.items.forEach((item) => {
            pdf.text(item.description, margin, yPos);
            pdf.text(item.qty.toString(), pageWidth - margin - 70, yPos);
            pdf.text(`$${item.rate.toFixed(2)}`, pageWidth - margin - 50, yPos);
            pdf.setFont("helvetica", "bold");
            pdf.text(
              `$${item.amount.toFixed(2)}`,
              pageWidth - margin - 5,
              yPos,
              { align: "right" },
            );
            pdf.setFont("helvetica", "normal");
            yPos += 6;

            pdf.setDrawColor(229, 231, 235);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 6;
          });

          yPos += 4;

          // Totals
          const totalsX = pageWidth - margin - 60;
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.text("Subtotal:", totalsX, yPos);
          pdf.setFont("helvetica", "bold");
          pdf.text(`$${subtotal.toFixed(2)}`, pageWidth - margin - 5, yPos, {
            align: "right",
          });
          yPos += 5;

          pdf.setFont("helvetica", "normal");
          pdf.text(`Tax (${values.TaxRate}%):`, totalsX, yPos);
          pdf.setFont("helvetica", "bold");
          pdf.text(`$${taxAmount.toFixed(2)}`, pageWidth - margin - 5, yPos, {
            align: "right",
          });
          yPos += 3;

          pdf.setDrawColor(209, 213, 219);
          pdf.setLineWidth(0.5);
          pdf.line(totalsX, yPos, pageWidth - margin, yPos);
          yPos += 5;

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text("Total:", totalsX, yPos);
          pdf.setTextColor(37, 99, 235);
          pdf.setFontSize(14);
          pdf.text(`$${total.toFixed(2)}`, pageWidth - margin - 5, yPos, {
            align: "right",
          });
          pdf.setTextColor(0, 0, 0);
          yPos += 10;

          // Notes
          if (values.Notes) {
            yPos += 5;
            pdf.setFillColor(249, 250, 251);
            const notesHeight = 20;
            pdf.rect(margin, yPos, pageWidth - 2 * margin, notesHeight, "F");

            pdf.setFontSize(8);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(107, 114, 128);
            pdf.text("NOTES", margin + 5, yPos + 5);

            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(55, 65, 81);
            const splitNotes = pdf.splitTextToSize(
              values.Notes,
              pageWidth - 2 * margin - 10,
            );
            pdf.text(splitNotes, margin + 5, yPos + 10);
            yPos += notesHeight + 5;
          }

          // Footer
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(107, 114, 128);
          pdf.text(
            "Thank you for your business!",
            pageWidth / 2,
            pageHeight - 15,
            { align: "center" },
          );

          pdf.save(`Invoice-${values.invoiceNum}.pdf`);
        } catch (error) {
          console.error("PDF generation error:", error);
          alert("Error generating PDF. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => {
        // Calculate totals
        const subtotal = values.items.reduce(
          (sum, item) => sum + item.amount,
          0,
        );
        const taxAmount = (subtotal * values.TaxRate) / 100;
        const total = subtotal + taxAmount;

        return (
          <Form className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Invoice Generator
                </h1>
                <p className="text-gray-600">
                  Create professional invoices in minutes
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="space-y-6">
                  {/* Invoice Details Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200">
                      <Hash
                        size={24}
                        className="text-blue-600"
                        strokeWidth={2.5}
                      />
                      <h2 className="text-xl font-bold text-gray-800">
                        Invoice Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Invoice Number */}
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                          Invoice #{" "}
                          <Asterisk size={10} className="text-red-500" />
                        </label>
                        <Field
                          type="text"
                          name="invoiceNum"
                          placeholder="INV-001"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        {touched.invoiceNum && errors.invoiceNum && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.invoiceNum}
                          </p>
                        )}
                      </div>

                      {/* Invoice Date */}
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                          Date <Asterisk size={10} className="text-red-500" />
                        </label>
                        <Field
                          type="date"
                          name="invoiceDate"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        {touched.invoiceDate && errors.invoiceDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.invoiceDate}
                          </p>
                        )}
                      </div>

                      {/* Due Date */}
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                          Due Date{" "}
                          <Asterisk size={10} className="text-red-500" />
                        </label>
                        <Field
                          type="date"
                          name="dueDate"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        {touched.dueDate && errors.dueDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.dueDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business Info Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b-2 border-blue-100">
                      <House
                        size={22}
                        className="text-blue-600"
                        strokeWidth={2.5}
                      />
                      <h2 className="text-xl font-bold text-gray-800">
                        Your Business
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                          Business Name{" "}
                          <Asterisk size={10} className="text-red-500" />
                        </label>
                        <Field
                          type="text"
                          name="BusinessName"
                          placeholder="Acme Corp"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        {touched.BusinessName && errors.BusinessName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.BusinessName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                            Email{" "}
                            <Asterisk size={10} className="text-red-500" />
                          </label>
                          <Field
                            type="email"
                            name="BusinessEmail"
                            placeholder="hello@acme.com"
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          />
                          {touched.BusinessEmail && errors.BusinessEmail && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.BusinessEmail}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                            Phone{" "}
                            <Asterisk size={10} className="text-red-500" />
                          </label>
                          <Field
                            type="text"
                            name="BusinessPhone"
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          />
                          {touched.BusinessPhone && errors.BusinessPhone && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.BusinessPhone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                          Address{" "}
                          <Asterisk size={10} className="text-red-500" />
                        </label>
                        <Field
                          as="textarea"
                          name="BusinessAddress"
                          placeholder="123 Business St, Suite 100&#10;City, State 12345"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                          rows="2"
                        />
                        {touched.BusinessAddress && errors.BusinessAddress && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.BusinessAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Client Info Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b-2 border-indigo-100">
                      <CloudDrizzle
                        size={22}
                        className="text-indigo-600"
                        strokeWidth={2.5}
                      />
                      <h2 className="text-xl font-bold text-gray-800">
                        Client
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                          Client Name{" "}
                          <Asterisk size={10} className="text-red-500" />
                        </label>
                        <Field
                          type="text"
                          name="ClientName"
                          placeholder="John Doe"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        {touched.ClientName && errors.ClientName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.ClientName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                            Email{" "}
                            <Asterisk size={10} className="text-red-500" />
                          </label>
                          <Field
                            type="email"
                            name="ClientEmail"
                            placeholder="john@example.com"
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          />
                          {touched.ClientEmail && errors.ClientEmail && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ClientEmail}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                            Phone{" "}
                            <Asterisk size={10} className="text-red-500" />
                          </label>
                          <Field
                            type="text"
                            name="ClientPhone"
                            placeholder="+1 (555) 999-0000"
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          />
                          {touched.ClientPhone && errors.ClientPhone && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ClientPhone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                          Address{" "}
                          <Asterisk size={10} className="text-red-500" />
                        </label>
                        <Field
                          as="textarea"
                          name="ClientAddress"
                          placeholder="456 Client Ave&#10;City, State 67890"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                          rows="2"
                        />
                        {touched.ClientAddress && errors.ClientAddress && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.ClientAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
                    <h2 className="text-xl font-bold text-gray-800">
                      Line Items
                    </h2>

                    {values.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">
                            Item {index + 1}
                          </span>
                          {values.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFieldValue(
                                  "items",
                                  values.items.filter((_, i) => i !== index),
                                )
                              }
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition text-sm"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                              Remove
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                            Description{" "}
                            <Asterisk size={10} className="text-red-500" />
                          </label>
                          <Field
                            type="text"
                            name={`items[${index}].description`}
                            placeholder="Web design services"
                            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          />
                          {touched.items?.[index]?.description &&
                            errors.items?.[index]?.description && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.items[index].description}
                              </p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                              Qty{" "}
                              <Asterisk size={10} className="text-red-500" />
                            </label>
                            <Field
                              type="number"
                              name={`items[${index}].qty`}
                              min="0"
                              step="1"
                              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              onChange={(e) => {
                                const newQty = Number(e.target.value) || 0;
                                setFieldValue(`items[${index}].qty`, newQty);
                                const rate = values.items[index].rate;
                                setFieldValue(
                                  `items[${index}].amount`,
                                  newQty * rate,
                                );
                              }}
                            />
                            {touched.items?.[index]?.qty &&
                              errors.items?.[index]?.qty && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.items[index].qty}
                                </p>
                              )}
                          </div>

                          <div>
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                              Rate{" "}
                              <Asterisk size={10} className="text-red-500" />
                            </label>
                            <Field
                              type="number"
                              name={`items[${index}].rate`}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              onChange={(e) => {
                                const newRate = Number(e.target.value) || 0;
                                setFieldValue(`items[${index}].rate`, newRate);
                                const qty = values.items[index].qty;
                                setFieldValue(
                                  `items[${index}].amount`,
                                  qty * newRate,
                                );
                              }}
                            />
                            {touched.items?.[index]?.rate &&
                              errors.items?.[index]?.rate && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.items[index].rate}
                                </p>
                              )}
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                              Amount
                            </label>
                            <div className="px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700 font-semibold">
                              ${item.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setFieldValue("items", [
                          ...values.items,
                          { description: "", qty: 1, rate: 0, amount: 0 },
                        ])
                      }
                      className="w-full py-3 border-2 border-dashed border-gray-400 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={20} strokeWidth={2.5} />
                      Add Item
                    </button>
                  </div>

                  {/* Tax & Notes */}
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-1.5">
                          Tax Rate (%){" "}
                          <Asterisk size={10} className="text-red-500" />
                        </label>
                        <Field
                          type="number"
                          name="TaxRate"
                          min="0"
                          step="0.01"
                          placeholder="8.5"
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        {touched.TaxRate && errors.TaxRate && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.TaxRate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Notes (Optional)
                        </label>
                        <Field
                          as="textarea"
                          name="Notes"
                          placeholder="Payment terms, thank you message..."
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                          rows="2"
                        />
                      </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-medium">
                          Subtotal:
                        </span>
                        <span className="text-gray-900 font-semibold">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-medium">
                          Tax ({values.TaxRate}%):
                        </span>
                        <span className="text-gray-900 font-semibold">
                          ${taxAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t-2 border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800">
                            Total:
                          </span>
                          <span className="text-2xl font-bold text-blue-600">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg"
                    >
                      {showPreview ? (
                        <>
                          <EyeOff size={20} strokeWidth={2.5} />
                          Hide Preview
                        </>
                      ) : (
                        <>
                          <Eye size={20} strokeWidth={2.5} />
                          Show Preview
                        </>
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                    >
                      <Download size={20} strokeWidth={2.5} />
                      {isSubmitting ? "Generating..." : "Download PDF"}
                    </button>
                  </div>
                </div>

                {/* Preview Section */}
                {showPreview && (
                  <div className="lg:sticky lg:top-8 h-fit">
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6">
                        <h3 className="font-bold text-lg">Invoice Preview</h3>
                      </div>
                      <div
                        ref={invoiceRef}
                        className="bg-white p-8 md:p-10"
                        style={{ minHeight: "800px" }}
                      >
                        {/* Invoice Header */}
                        <div className="border-b-4 border-blue-600 pb-6 mb-8">
                          <h1 className="text-5xl font-bold text-gray-900 mb-2">
                            INVOICE
                          </h1>
                          <p className="text-gray-600 text-lg">
                            #{values.invoiceNum || "---"}
                          </p>
                        </div>

                        {/* From/To Section */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                              From
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {values.BusinessName || "Your Business"}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                {values.BusinessAddress || "Business Address"}
                              </p>
                              <p>
                                {values.BusinessEmail || "email@business.com"}
                              </p>
                              <p>{values.BusinessPhone || "Phone Number"}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                              Bill To
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {values.ClientName || "Client Name"}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{values.ClientAddress || "Client Address"}</p>
                              <p>{values.ClientEmail || "client@email.com"}</p>
                              <p>{values.ClientPhone || "Client Phone"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">
                              Invoice Date
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {values.invoiceDate || "---"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">
                              Due Date
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {values.dueDate || "---"}
                            </p>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-300">
                                <th className="text-left py-3 px-2 text-sm font-bold text-gray-700 uppercase">
                                  Description
                                </th>
                                <th className="text-center py-3 px-2 text-sm font-bold text-gray-700 uppercase">
                                  Qty
                                </th>
                                <th className="text-center py-3 px-2 text-sm font-bold text-gray-700 uppercase">
                                  Rate
                                </th>
                                <th className="text-right py-3 px-2 text-sm font-bold text-gray-700 uppercase">
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {values.items.map((item, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-gray-200"
                                >
                                  <td className="py-3 px-2 text-sm text-gray-800">
                                    {item.description || "---"}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-gray-800 text-center">
                                    {item.qty}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-gray-800 text-center">
                                    ${item.rate.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">
                                    ${item.amount.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-8">
                          <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Subtotal:</span>
                              <span className="font-semibold text-gray-900">
                                ${subtotal.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                Tax ({values.TaxRate}%):
                              </span>
                              <span className="font-semibold text-gray-900">
                                ${taxAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="border-t-2 border-gray-300 pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="text-lg font-bold text-gray-900">
                                  Total:
                                </span>
                                <span className="text-2xl font-bold text-blue-600">
                                  ${total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {values.Notes && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                              Notes
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {values.Notes}
                            </p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
                          <p className="text-xs text-gray-500">
                            Thank you for your business!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default Body;
