import AppLayout from '../layouts/AppLayout'

const Profile = () => (
  <AppLayout>
    <div style={{ padding: '20px 0' }}>
      <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'11px', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--ember)', marginBottom:'12px' }}>// Coming next</p>
      <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'48px', letterSpacing:'0.04em', color:'var(--text-primary)', fontWeight:400 }}>Profile</h1>
      <p style={{ fontSize:'14px', color:'var(--text-secondary)', marginTop:'8px' }}>This screen is next on the build list.</p>
    </div>
  </AppLayout>
)

export default Profile
