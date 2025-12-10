import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter"; // Menggunakan wouter untuk navigasi

export default function CustomerServiceForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [, navigate] = useLocation(); // navigate untuk kembali ke halaman

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Kirim ke backend (TRPC / API)
    console.log("Submitted:", form);

    alert("Your message has been sent. Our customer service will contact you.");

    // Reset form
    setForm({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard"); // Arahkan ke /dashboard
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 select-none">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Customer Service Form
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="youremail@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input
                type="tel"
                name="phone"
                placeholder="0812 xxxx xxxx"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                name="message"
                rows={4}
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            {/* Tombol untuk kembali ke Dashboard dan kirim pesan */}
            <div className="mt-4 flex justify-between gap-2">
              <Button
                className="w-1/2 py-2 border border-blue-500 text-blue-500 bg-white hover:bg-blue-50 dark:border-blue-700 dark:text-blue-700 dark:bg-white dark:hover:bg-blue-900"
                onClick={handleBackToDashboard}
              >
                Back to Dashboard
              </Button>

              <Button
                type="submit"
                className="w-1/2 py-2 bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Send Message
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
