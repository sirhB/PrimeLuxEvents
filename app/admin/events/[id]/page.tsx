'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, MoreHorizontal, Share, Printer, MessageSquare, Phone, Mail, Globe, X, Instagram, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EventOverview } from '@/components/admin/events/event-overview'
import { EventOrders } from '@/components/admin/events/event-orders'
import { EventTasks } from '@/components/admin/events/event-tasks'
import { EventNotes } from '@/components/admin/events/event-notes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

// Mock event data
const event = {
    id: 'EVT-001',
    name: "Emma & Liam's Wedding",
    date: '2025-08-20',
    location: 'Seaside Cliffs Resort, Malibu, California',
    status: 'confirmed',
    guestCount: 150,
    budget: 45000,
    manager: 'Maya Brooks'
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 bg-white border-b border-gray-200">
                    <Link href="/admin/events" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Events
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">3 days left</Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 gap-2">
                                <span>August 20, 4:00 PM</span>
                                <span>•</span>
                                <span>{event.location}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon">
                                <Share className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="flex-1 p-8">
                    <Tabs defaultValue="orders" className="w-full">
                        <TabsList className="bg-transparent p-0 border-b border-gray-200 w-full justify-start h-auto rounded-none mb-6">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--dashboard-accent-purple)] data-[state=active]:text-[var(--dashboard-accent-purple)] rounded-none px-4 py-2"
                            >
                                Event Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="orders"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--dashboard-accent-purple)] data-[state=active]:text-[var(--dashboard-accent-purple)] rounded-none px-4 py-2"
                            >
                                Associated Orders
                            </TabsTrigger>
                            <TabsTrigger
                                value="tasks"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--dashboard-accent-purple)] data-[state=active]:text-[var(--dashboard-accent-purple)] rounded-none px-4 py-2"
                            >
                                Tasks
                            </TabsTrigger>
                            <TabsTrigger
                                value="notes"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--dashboard-accent-purple)] data-[state=active]:text-[var(--dashboard-accent-purple)] rounded-none px-4 py-2"
                            >
                                Notes
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-6">
                            <div className="flex-1">
                                <TabsContent value="overview" className="mt-0">
                                    <EventOverview event={event} />
                                </TabsContent>
                                <TabsContent value="orders" className="mt-0">
                                    <EventOrders />
                                </TabsContent>
                                <TabsContent value="tasks" className="mt-0">
                                    <EventTasks />
                                </TabsContent>
                                <TabsContent value="notes" className="mt-0">
                                    <EventNotes />
                                </TabsContent>
                            </div>

                            {/* Side Panel - Visible on larger screens */}
                            <div className="hidden xl:block w-80 bg-white rounded-lg border border-gray-200 shadow-sm h-fit">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Vendor Information</h3>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="p-4">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-[var(--dashboard-accent-purple)]">Glow Studio</h4>
                                            <div className="flex gap-2">
                                                <Instagram className="h-4 w-4 text-gray-400" />
                                                <Globe className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500">Hair & Makeup</p>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src="/placeholder-avatar.jpg" />
                                            <AvatarFallback>AC</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">Ava Collins</p>
                                            <p className="text-xs text-gray-500">Owner & Art Director at Glow Studio</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-[var(--dashboard-accent-purple)]">+1 (555) 923-1284</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span className="text-[var(--dashboard-accent-purple)]">ava.collins@glowstudio.com</span>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="mb-6">
                                        <h4 className="font-medium text-sm mb-3">Overview</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Status</span>
                                                <span className="text-green-600 font-medium">Confirmed</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Last call</span>
                                                <span className="text-gray-900">Aug 12, 2025</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Manager</span>
                                                <span className="text-gray-900">Maya Brooks</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-sm">Financial Summary</h4>
                                            <Pencil className="h-3 w-3 text-gray-400" />
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total service cost</span>
                                                <span className="text-gray-900">$3,100</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Amount paid</span>
                                                <span className="text-gray-900">$1,600</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Pending balance</span>
                                                <span className="text-gray-900">$1,500</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Due Date</span>
                                                <span className="text-orange-600">Aug 18, 2025 (Tomorrow)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                        <Button className="w-full bg-[var(--dashboard-accent-purple)] hover:bg-[var(--dashboard-accent-purple)]/90">Message</Button>
                                        <Button variant="outline" className="w-full bg-purple-50 text-[var(--dashboard-accent-purple)] border-purple-100 hover:bg-purple-100">Schedule Call</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

