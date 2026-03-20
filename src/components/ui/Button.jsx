// Shadcn UI components directory
// Add your Shadcn components here (Button, Card, Dialog, etc.)
// Run: npx shadcn-ui@latest init
// Then: npx shadcn-ui@latest add button card dialog ...

export function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}
