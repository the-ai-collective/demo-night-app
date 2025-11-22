"use client"

import type React from "react"

export const SubmissionReceivedTemplate = ({ personName, startupName }: {
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

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    backgroundColor: "#f97316",
    color: "white",
    padding: "12px 28px",
    borderRadius: "24px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  }

  const dividerStyle: React.CSSProperties = {
    height: "1px",
    backgroundColor: "#e5e0da",
    margin: "40px 0",
    border: "none",
  }

  const featureBoxStyle: React.CSSProperties = {
    backgroundColor: "#faf9f7",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "20px",
    borderLeft: "4px solid #f97316",
  }

  const featureTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2a2925",
    margin: "0 0 8px 0",
  }

  const featureTextStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#6a6057",
    margin: "0",
    lineHeight: "1.5",
  }

  return (
    <div style={containerStyle}>
      <table style={wrapperStyle}>
        <tbody>
        <tr>
          <td style={headerStyle}>
            <h1 style={headerTitleStyle}>Demo Received</h1>
          </td>
        </tr>

        <tr>
          <td style={contentStyle}>
            <h2 style={sectionTitleStyle}>Dear {personName},</h2>
            <p style={textStyle}>
              This email is to inform you that we&apos;ve received your submission for {startupName}, and we&apos;re ecstatic to have you join us!
              We&apos;ll contact you with a status update regarding your submission as soon as we get the chance to review it.
              <br/><br/>

              Please keep the following points in mind in the event that your submission is accepted:
            </p>

            <div style={featureBoxStyle}>
              <h3 style={featureTitleStyle}>Keep It Short</h3>
              <p style={featureTextStyle}>
                All demos are capped to three minutes. Please be courteous to others demonstrating by ensuring
                your demonstration will fit in this time constraint.
              </p>
            </div>

            <div style={featureBoxStyle}>
              <h3 style={featureTitleStyle}>Tell A Story</h3>
              <p style={featureTextStyle}>
                Your primary focus while presenting should be keeping your audience engaged. Ensure your
                demonstration is structured clearly, and naturally flows like a story - with a beginning, middle,
                and end.
              </p>
            </div>

            <div style={featureBoxStyle}>
              <h3 style={featureTitleStyle}>End With A Summary</h3>
              <p style={featureTextStyle}>
                Remember, humans have a low attention span! Ending with a summary ensures that your most
                significant points and your value added are fresh in the mind of your audience.
              </p>
            </div>

            <p style={textStyle}>Need more tips? Read through our <a
              style={{
                color: "rgb(249 115 22 / 0.8)",
                textDecoration: "underline",
                textDecorationColor: "rgb(249 115 22 / 0.8)"
            }}
              href="https://theaicollective.notion.site/demo-night-guidelines"> Demo Night Guidelines</a> if you need any more help!
            </p>
          </td>
        </tr>

        <tr>
          <td style={{ padding: "0 32px" }}>
            <hr style={dividerStyle} />
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  )
}
