import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface PremiumUpgradeProps {
  onUpgrade: () => void
}

export default function PremiumUpgrade({ onUpgrade }: PremiumUpgradeProps) {
  const [isOpen, setIsOpen] = useState(false)

  const features = [
    "See who likes you",
    "Unlimited likes",
    "Rewind your last swipe",
    "5 Super Likes per day",
    "Passport to any location",
    "No ads"
  ]

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full"
      >
        <Zap className="mr-2 h-4 w-4" /> Upgrade to Premium
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Upgrade to Premium</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={onUpgrade}>
                    <Zap className="mr-2 h-4 w-4" /> Upgrade Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}