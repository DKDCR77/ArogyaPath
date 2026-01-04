import { ReactNode } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export default function Layout({ 
  children, 
  title = 'आरोग्यPath', 
  description = 'Find PMJAY empaneled hospitals near you'
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      >
        {children}
      </motion.div>
    </>
  )
}
