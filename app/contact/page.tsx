import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail } from "lucide-react"
import { getSiteContent } from "@/lib/content"

export default async function ContactPage() {
  const content = await getSiteContent()

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">{content['contact.hero.title']}</h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {content['contact.hero.description']}
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{content['contact.info.address.title']}</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {content['contact.info.address.value']}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{content['contact.info.phone.title']}</h3>
                  <p className="text-muted-foreground">{content['contact.info.phone.value']}</p>
                  <p className="text-sm text-muted-foreground mt-1">{content['contact.info.phone.hours']}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{content['contact.info.email.title']}</h3>
                  <p className="text-muted-foreground">{content['contact.info.email.value']}</p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full bg-muted rounded-lg overflow-hidden relative">
              {/* Map Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-muted-foreground/10">
                <span className="text-muted-foreground font-medium">Map View</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-muted/30 p-8 md:p-12 rounded-lg border border-border/50">
            <h2 className="text-2xl font-serif mb-6">{content['contact.form.title']}</h2>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="jane@example.com" type="email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="(555) 000-0000" type="tel" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-date">Event Date (Optional)</Label>
                <Input id="event-date" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us about your event..." className="min-h-[150px]" />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
