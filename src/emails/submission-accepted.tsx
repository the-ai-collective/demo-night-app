"use client"

import type React from "react"

export const SubmissionRejectedTemplate = ({ personName, startupName }: {
  personName: string,
  startupName: string
}) => {
  const containerStyle: React.CSSProperties = {
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: "#f8f7f5",
    padding: "0",
    margin: "0",
    minHeight: "100vh",
  }

  const wrapperStyle: React.CSSProperties = {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "white",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  }

  const headerStyle: React.CSSProperties = {
    padding: "40px 32px",
    background: "linear-gradient(135deg, #f5f3f0 0%, #faf9f7 100%)",
    borderBottom: "1px solid #e5e0da",
  }

  const headerTitleStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "600",
    color: "#2a2925",
    margin: "0 0 8px 0",
    lineHeight: "1.3",
  }

  const contentStyle: React.CSSProperties = {
    padding: "40px 32px",
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2a2925",
    margin: "0 0 16px 0",
    lineHeight: "1.4",
  }

  const textStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#5a5551",
    lineHeight: "1.6",
    margin: "0 0 20px 0",
  }

  return (
    <div style={containerStyle}>
      <table style={wrapperStyle}>
        <tbody>
        <tr>
          <td style={headerStyle}>
            <h1 style={headerTitleStyle}>Demonstration Submission Accepted | Welcome!</h1>
          </td>
        </tr>

        <tr>
          <td style={contentStyle}>
            <h2 style={sectionTitleStyle}>Dear {personName},</h2>
            <p style={textStyle}>
              This email is to inform you that we&apos;ve reviewed and accepted your submission for {startupName},
              and we&apos;re ecstatic to have you join us!

              <br/><br/>

              Please ensure that you&apos;ve reviewed our <a
              style={{
                color: "rgb(249 115 22 / 0.8)",
                textDecoration: "underline",
                textDecorationColor: "rgb(249 115 22 / 0.8)"
              }}
              href="https://theaicollective.notion.site/demo-night-guidelines"> Demo Night Guidelines</a>.
              <br/>
              We&apos;re excited to have you here!
            </p>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  )
}
