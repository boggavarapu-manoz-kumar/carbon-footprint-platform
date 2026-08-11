import axiosInstance from '../api/axiosConfig';

export const generateCarbonReport = async () => {
  try {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const token = localStorage.getItem('token');
    
    // Fetch data for the report
    const [profileRes, metricsRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/v1/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/v1/carbon/metrics/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);
    
    const profile = await profileRes.json();
    const metrics = await metricsRes.json();
    
    // Build PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text("Carbon Footprint Report", 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(`User: ${profile.firstName} ${profile.lastName}`, 20, 60);
    doc.text(`Email: ${profile.email}`, 20, 70);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 80, 190, 80);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Your Statistics", 20, 95);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Total Emissions (30 days): ${metrics.totalEmissions30Days?.toFixed(2) || 0} kg CO2e`, 20, 110);
    doc.text(`Average Daily Emissions: ${((metrics.totalEmissions30Days || 0) / 30).toFixed(2)} kg CO2e`, 20, 120);
    doc.text(`Total Activities Logged: ${metrics.totalActivities30Days || 0}`, 20, 130);
    
    // Footnote
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated securely via Carbon Footprint Platform Assistant", 20, 280);
    
    doc.save(`Carbon_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return false;
  }
};
