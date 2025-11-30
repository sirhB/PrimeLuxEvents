import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react'

export const metadata = {
    title: 'Upcoming Events | PrimeLux Events',
    description: 'Discover upcoming events and find the perfect rental packages for your special occasion.',
}

export default async function EventsPage() {
    const supabase = await createClient()
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .eq('status', 'confirmed')
        .order('event_date', { ascending: true })
        .limit(20)

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/30 z-10" />
                <Image
                    src="/images/events-hero.jpg" // You'll need to add this image
                    alt="Upcoming Events"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="relative z-20 container px-4 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-serif font-light mb-6 tracking-tight">
                        Upcoming Events
                    </h1>
                    <p className="text-lg md:text-xl font-light max-w-2xl mx-auto text-white/90">
                        Discover exciting events in your area and find the perfect PrimeLux packages to make your celebration unforgettable.
                    </p>
                </div>
            </section>

            {/* Events Grid */}
            <section className="py-24 px-4 md:px-6 container mx-auto">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-serif mb-4">Featured Events</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Browse upcoming events and see what packages are popular for similar occasions.
                    </p>
                </div>

                {events && events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <Link
                                href={`/events/${event.id}`}
                                key={event.id}
                                className="group block"
                            >
                                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1 border-gold/20">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary rounded-t-lg">
                                        <Image
                                            src={event.image_url || '/placeholder.jpg'}
                                            alt={event.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-gold text-black hover:bg-gold/90 border-none">
                                                {event.event_type?.toUpperCase() || 'EVENT'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-serif mb-3 group-hover:text-gold transition-colors">
                                            {event.name}
                                        </h3>

                                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(event.event_date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {event.location}
                                                </div>
                                            )}
                                            {event.guest_count && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    {event.guest_count} guests
                                                </div>
                                            )}
                                        </div>

                                        <Button variant="outline" className="w-full group/btn">
                                            View Event Details
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-2xl font-serif text-muted-foreground mb-2">No upcoming events</h3>
                        <p className="text-gray-500 mb-8">Check back soon for exciting events in your area.</p>
                        <Button asChild>
                            <Link href="/packages">Browse Packages Instead</Link>
                        </Button>
                    </div>
                )}

                {/* Call to Action */}
                {events && events.length > 0 && (
                    <div className="mt-16 text-center">
                        <div className="bg-gold/10 rounded-2xl p-8 md:p-12">
                            <h3 className="text-2xl font-serif mb-4">Planning Your Own Event?</h3>
                            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                Discover our curated packages designed for events just like these.
                                From intimate gatherings to grand celebrations, we have everything you need.
                            </p>
                            <Button size="lg" asChild>
                                <Link href="/packages">Explore Packages</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}