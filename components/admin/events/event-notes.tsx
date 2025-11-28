'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Pencil } from 'lucide-react'

export function EventNotes() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Event Notes</CardTitle>
                    <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 text-sm text-yellow-900">
                        <p className="mb-2 font-semibold">Important:</p>
                        <p>Ava will arrive at the bride's suite at 7:30 AM on the wedding day.</p>
                    </div>
                    <div className="mt-4 bg-red-50 p-4 rounded-md border border-red-100 text-sm text-red-900">
                        <p className="mb-2 font-semibold">Allergy Alert:</p>
                        <p>The bride is allergic to lanolin. Please avoid any products that contain this ingredient.</p>
                    </div>
                    <div className="mt-6">
                        <label className="text-sm font-medium mb-2 block">Add new note</label>
                        <Textarea placeholder="Type your note here..." className="min-h-[100px]" />
                        <Button className="mt-2">Save Note</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
