import {
  Asterisk,
  Download,
  Hash,
  House,
  Trash2,
  Plus,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useRef, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Body = () => {
  const invoiceRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Formik
        initialValues={{
          invoiceNum: "",
          invoiceDate: "",
          dueDate: "",
          BusinessName: "",
          emailVal: "",
          PhoneVal: "",
          Address: "",
          ClientName: "",
          ClientPhone: "",
          ClientAddress: "",
          ClientEmailVal: "",
          TaxRate: "",
          Notes: "",
          items: [{ description: "", qty: 0, rate: 0, amount: 0 }],
        }}
        validationSchema={yup.object({
          invoiceNum: yup.string().required("Required"),
          invoiceDate: yup.string().required("Required"),
          dueDate: yup.string().required("Required"),
          BusinessName: yup.string().required("Required"),
          emailVal: yup.string().email("Invalid email").required("Required"),
          PhoneVal: yup.string().required("Required"),
          ClientName: yup.string().required("Required"),
          ClientEmailVal: yup
            .string()
            .email("Invalid email")
            .required("Required"),
          ClientPhone: yup.string().required("Required"),
          ClientAddress: yup.string().required("Required"),
          TaxRate: yup.number().min(0).required("Required"),
          items: yup
            .array()
            .of(
              yup.object().shape({
                description: yup.string().required("Required"),
                qty: yup.number().min(0).required("Required"),
                rate: yup.number().min(0).required("Required"),
              }),
            )
            .min(1, "At least one item required"),
        })}
        onSubmit={async (values) => {
          if (!invoiceRef.current) return;

          const canvas = await html2canvas(invoiceRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/png");

          const pdf = new jsPDF("p", "mm", "a4");
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const imgHeight = (canvas.height * pageWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(`invoice-${values.invoiceNum}.pdf`);
          console.log("SUBMITTING", values);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          setFieldValue,
          handleSubmit,
        }) => {
          const subtotal = values.items.reduce(
            (sum, item) => sum + item.amount,
            0,
          );
          const taxAmount = (subtotal * (Number(values.TaxRate) || 0)) / 100;
          const total = subtotal + taxAmount;

          return (
            <Form className="max-w-7xl mx-auto p-4 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT PANEL - FORM */}
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                          Invoice Generator
                        </h1>
                        <p className="text-slate-500 text-sm">
                          Create professional invoices instantly
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details Card */}
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-slate-800">
                        Invoice Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Invoice Number{" "}
                          <Asterisk className="inline w-3 h-3 text-red-500" />
                        </label>
                        <Field
                          name="invoiceNum"
                          placeholder="INV-001"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                        {touched.invoiceNum && errors.invoiceNum && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.invoiceNum}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Invoice Date{" "}
                          <Asterisk className="inline w-3 h-3 text-red-500" />
                        </label>
                        <Field
                          type="date"
                          name="invoiceDate"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                        {touched.invoiceDate && errors.invoiceDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.invoiceDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Due Date{" "}
                          <Asterisk className="inline w-3 h-3 text-red-500" />
                        </label>
                        <Field
                          type="date"
                          name="dueDate"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-slate-800">
                        From (Your Business)
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Business Name{" "}
                          <Asterisk className="inline w-3 h-3 text-red-500" />
                        </label>
                        <Field
                          name="BusinessName"
                          placeholder="Your Business Name"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                        {touched.BusinessName && errors.BusinessName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.BusinessName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Mail className="inline w-4 h-4 mr-1" />
                            Email{" "}
                            <Asterisk className="inline w-3 h-3 text-red-500" />
                          </label>
                          <Field
                            type="email"
                            name="emailVal"
                            placeholder="business@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          />
                          {touched.emailVal && errors.emailVal && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.emailVal}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Phone className="inline w-4 h-4 mr-1" />
                            Phone{" "}
                            <Asterisk className="inline w-3 h-3 text-red-500" />
                          </label>
                          <Field
                            name="PhoneVal"
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          />
                          {touched.PhoneVal && errors.PhoneVal && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.PhoneVal}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <MapPin className="inline w-4 h-4 mr-1" />
                          Address
                        </label>
                        <Field
                          as="textarea"
                          name="Address"
                          rows="2"
                          placeholder="123 Business St, City, ZIP"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Client Info Card */}
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <User className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-xl font-semibold text-slate-800">
                        To (Client)
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Client Name{" "}
                          <Asterisk className="inline w-3 h-3 text-red-500" />
                        </label>
                        <Field
                          name="ClientName"
                          placeholder="Client Name"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                        {touched.ClientName && errors.ClientName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.ClientName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Mail className="inline w-4 h-4 mr-1" />
                            Email{" "}
                            <Asterisk className="inline w-3 h-3 text-red-500" />
                          </label>
                          <Field
                            type="email"
                            name="ClientEmailVal"
                            placeholder="client@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          />
                          {touched.ClientEmailVal && errors.ClientEmailVal && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ClientEmailVal}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Phone className="inline w-4 h-4 mr-1" />
                            Phone{" "}
                            <Asterisk className="inline w-3 h-3 text-red-500" />
                          </label>
                          <Field
                            name="ClientPhone"
                            placeholder="+1 (555) 999-0000"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                          />
                          {touched.ClientPhone && errors.ClientPhone && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ClientPhone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          <MapPin className="inline w-4 h-4 mr-1" />
                          Address{" "}
                          <Asterisk className="inline w-3 h-3 text-red-500" />
                        </label>
                        <Field
                          as="textarea"
                          name="ClientAddress"
                          rows="2"
                          placeholder="Client Address"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
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
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h2 className="text-xl font-semibold text-slate-800">
                          Line Items
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFieldValue("items", [
                            ...values.items,
                            { description: "", qty: 0, rate: 0, amount: 0 },
                          ])
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-4">
                      {values.items.map((item, index) => (
                        <div
                          key={index}
                          className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-700">
                              Item {index + 1}
                            </h3>
                            {values.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFieldValue(
                                    "items",
                                    values.items.filter((_, i) => i !== index),
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Description{" "}
                                <Asterisk className="inline w-3 h-3 text-red-500" />
                              </label>
                              <Field
                                name={`items[${index}].description`}
                                placeholder="Service or product description"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Qty{" "}
                                  <Asterisk className="inline w-3 h-3 text-red-500" />
                                </label>
                                <Field
                                  type="number"
                                  name={`items[${index}].qty`}
                                  placeholder="0"
                                  onChange={(e) => {
                                    handleChange(e);
                                    const newQty = Number(e.target.value);
                                    const rate = values.items[index].rate;
                                    setFieldValue(
                                      `items[${index}].amount`,
                                      newQty * rate,
                                    );
                                  }}
                                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                />
                                {touched.items?.[index]?.qty &&
                                  errors.items?.[index]?.qty && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {errors.items[index].qty}
                                    </p>
                                  )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Rate ($){" "}
                                  <Asterisk className="inline w-3 h-3 text-red-500" />
                                </label>
                                <Field
                                  type="number"
                                  name={`items[${index}].rate`}
                                  placeholder="0"
                                  onChange={(e) => {
                                    handleChange(e);
                                    const newRate = Number(e.target.value);
                                    const qty = values.items[index].qty;
                                    setFieldValue(
                                      `items[${index}].amount`,
                                      qty * newRate,
                                    );
                                  }}
                                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                />
                                {touched.items?.[index]?.rate &&
                                  errors.items?.[index]?.rate && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {errors.items[index].rate}
                                    </p>
                                  )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Amount
                                </label>
                                <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 font-semibold">
                                  ${item.amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tax & Notes */}
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tax Rate (%){" "}
                          <Asterisk className="inline w-3 h-3 text-red-500" />
                        </label>
                        <Field
                          type="number"
                          name="TaxRate"
                          placeholder="0"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                        {touched.TaxRate && errors.TaxRate && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.TaxRate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Notes
                        </label>
                        <Field
                          as="textarea"
                          name="Notes"
                          rows="3"
                          placeholder="Additional notes or payment terms..."
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600">Subtotal:</span>
                          <span className="font-semibold text-slate-800">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600">
                            Tax ({values.TaxRate || 0}%):
                          </span>
                          <span className="font-semibold text-slate-800">
                            ${taxAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span className="text-lg font-bold text-slate-800">
                            Total:
                          </span>
                          <span className="text-2xl font-bold text-blue-600">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl font-semibold text-lg"
                      >
                        <Download className="w-5 h-5" />
                        Download Invoice (PDF)
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL - PREVIEW */}
                <div className="lg:sticky lg:top-8 lg:h-fit">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6">
                      Live Preview
                    </h2>

                    <div
                      ref={invoiceRef}
                      className="bg-white p-8 border-2 border-slate-200 rounded-lg"
                    >
                      {/* Invoice Header */}
                      <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-800 mb-2">
                          INVOICE
                        </h1>
                        <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded"></div>
                      </div>

                      {/* Invoice Info */}
                      <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            Invoice Number
                          </p>
                          <p className="font-semibold text-slate-800">
                            {values.invoiceNum || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            Invoice Date
                          </p>
                          <p className="font-semibold text-slate-800">
                            {values.invoiceDate || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            Due Date
                          </p>
                          <p className="font-semibold text-slate-800">
                            {values.dueDate || "—"}
                          </p>
                        </div>
                      </div>

                      {/* From/To Section */}
                      <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                          <p className="text-xs font-semibold text-blue-600 mb-2">
                            FROM
                          </p>
                          <p className="font-bold text-slate-800">
                            {values.BusinessName || "Your Business"}
                          </p>
                          <p className="text-sm text-slate-600">
                            {values.emailVal}
                          </p>
                          <p className="text-sm text-slate-600">
                            {values.PhoneVal}
                          </p>
                          <p className="text-sm text-slate-600">
                            {values.Address}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-indigo-600 mb-2">
                            TO
                          </p>
                          <p className="font-bold text-slate-800">
                            {values.ClientName || "Client Name"}
                          </p>
                          <p className="text-sm text-slate-600">
                            {values.ClientEmailVal}
                          </p>
                          <p className="text-sm text-slate-600">
                            {values.ClientPhone}
                          </p>
                          <p className="text-sm text-slate-600">
                            {values.ClientAddress}
                          </p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <table className="w-full mb-8">
                        <thead>
                          <tr className="border-b-2 border-slate-800">
                            <th className="text-left py-3 text-sm font-semibold text-slate-800">
                              Description
                            </th>
                            <th className="text-right py-3 text-sm font-semibold text-slate-800">
                              Qty
                            </th>
                            <th className="text-right py-3 text-sm font-semibold text-slate-800">
                              Rate
                            </th>
                            <th className="text-right py-3 text-sm font-semibold text-slate-800">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {values.items.map((item, i) => (
                            <tr key={i} className="border-b border-slate-200">
                              <td className="py-3 text-sm text-slate-700">
                                {item.description || "—"}
                              </td>
                              <td className="text-right py-3 text-sm text-slate-700">
                                {item.qty || 0}
                              </td>
                              <td className="text-right py-3 text-sm text-slate-700">
                                ${item.rate.toFixed(2)}
                              </td>
                              <td className="text-right py-3 text-sm font-semibold text-slate-800">
                                ${item.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Totals */}
                      <div className="flex justify-end mb-8">
                        <div className="w-64">
                          <div className="flex justify-between py-2">
                            <span className="text-sm text-slate-600">
                              Subtotal:
                            </span>
                            <span className="text-sm font-semibold text-slate-800">
                              ${subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-sm text-slate-600">
                              Tax ({values.TaxRate || 0}%):
                            </span>
                            <span className="text-sm font-semibold text-slate-800">
                              ${taxAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-3 border-t-2 border-slate-800">
                            <span className="font-bold text-slate-800">
                              Total:
                            </span>
                            <span className="text-xl font-bold text-blue-600">
                              ${total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {values.Notes && (
                        <div className="pt-6 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-600 mb-2">
                            NOTES
                          </p>
                          <p className="text-sm text-slate-700">
                            {values.Notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Body;
