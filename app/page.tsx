"use client"

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import jsonPermissions from "./data-pythnet.json"

function getData(m: number, z: number, n: number, y: number) {
  let data = {}
  let adjustedM = m  * (n / 530)
  for (let feed of Object.keys(jsonPermissions)) {
    let numberOfPublishers = jsonPermissions[feed].priceAccounts[0].publishers.length
    for (let publisher of jsonPermissions[feed].priceAccounts[0].publishers) {
      if (data[publisher] === undefined) {
        data[publisher] = adjustedM / Math.max(numberOfPublishers, z)
      }
      else {
        data[publisher] += adjustedM / Math.max(numberOfPublishers, z)
      }
    }
  }
  return Object.entries(data).filter(([key, value]) => (key !="HUZu4xMSHbxTWbkXR6jkGdjvDPJLjrpSNXSoUFBRgjWs")).map(([key, value]) => ({ name: key, value: value }))

}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-2 shadow-md rounded-md">
        <p className="font-bold">{`${label}`}</p>
        <p className="text-primary">{`Value: ${formatNumber(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const getColorFromName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const formatNumber = (num) => {
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export default function Component() {
  const [m, setM] = useState(1)
  const [z, setZ] = useState(32)
  const [n, setN] = useState(500)
  const [y, setY] = useState(50)

  const data = useMemo(() => {
    const calculatedData = getData(m,z,n,y).map(item => ({
      name: item.name,
      value: item.value,
      fill: getColorFromName(item.name)
    })).sort((a, b) => b.value - a.value);

    const sum = calculatedData.reduce((acc, item) => acc + item.value, 0) * y/100;

    return {
      bars: calculatedData,
      sum: sum
    };
  }, [m, z, n, y])

  const gaugePercentage = Math.min((data.sum / 100000000) * 100, 100);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>OIS parameters simulation</CardTitle>
        <CardDescription>Adjust M, Z, N, and Y to see the chart update. Publisher caps are sorted in descending order.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="m-slider">M: {formatNumber(m)}</Label>
              <Slider
                id="m-slider"
                min={0}
                max={8}
                step={0.01}
                value={[Math.log10(m)]}
                onValueChange={(values) => setM(Math.pow(10, values[0]))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="z-slider">Z: {formatNumber(z)}</Label>
              <Slider
                id="z-slider"
                min={0}
                max={64}
                step={1}
                value={[z]}
                onValueChange={(values) => setZ(values[0])}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="n-slider">N: {formatNumber(n)}</Label>
              <Slider
                id="n-slider"
                min={1}
                max={1000}
                step={1}
                value={[n]}
                onValueChange={(values) => setN(values[0])}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="y-slider">Y: {y}%</Label>
              <Slider
                id="y-slider"
                min={0}
                max={100}
                step={1}
                value={[y]}
                onValueChange={(values) => setY(values[0])}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Total rewards distributed: {formatNumber(data.sum)}</Label>
              <Label>Number of publishers: {data.bars.length}</Label>
            </div>
            <Progress 
              value={gaugePercentage} 
              className="h-4"
              indicatorClassName={data.sum > 100000000 ? 'bg-red-500' : ''}
            />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}