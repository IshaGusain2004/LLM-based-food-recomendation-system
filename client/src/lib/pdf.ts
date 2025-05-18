import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AnalysisResult, FormData } from '@/contexts/FormContext';
import { format } from 'date-fns';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF & { previous: { finalY: number } };
    internal: {
      getCurrentPageInfo: () => { pageNumber: number };
      pageSize: { height: number };
    };
  }
}

export function generatePDF(analysisResults: AnalysisResult, formData: FormData) {
  try {
    const doc = new jsPDF();
    let currentY = 20;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(76, 70, 229); // primary-600 color
    doc.text('Product Analysis Report', 20, currentY);
    currentY += 10;
    
    // Add product info
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text(`Product: ${analysisResults.productName}`, 20, currentY);
    currentY += 8;
    
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(`Category: ${analysisResults.productCategory}`, 20, currentY);
    currentY += 8;
    
    // Add user info
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55); // gray-800
    const ageGroup = formData.ageGroup.charAt(0).toUpperCase() + formData.ageGroup.slice(1);
    const healthConditions = formData.healthConditions.map(c => c.name).join(", ");
    doc.text(`Analysis for: ${ageGroup} with ${healthConditions}`, 20, currentY);
    currentY += 8;
    doc.text(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, 20, currentY);
    currentY += 8;
    
    // Suitability rating
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('Suitability Rating:', 20, currentY);
    
    let ratingColor;
    if (analysisResults.suitability === 'Good') {
      ratingColor = [16, 185, 129]; // green-500
    } else if (analysisResults.suitability === 'Moderate') {
      ratingColor = [245, 158, 11]; // yellow-500
    } else {
      ratingColor = [239, 68, 68]; // red-500
    }
    
    doc.setFontSize(12);
    doc.setTextColor(ratingColor[0], ratingColor[1], ratingColor[2]);
    doc.text(`${analysisResults.suitability} (${analysisResults.suitabilityRating}%)`, 80, currentY);
    currentY += 10;
    
    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('Summary:', 20, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81); // gray-700
    const summary = `This product is generally ${analysisResults.suitability.toLowerCase()} for ${formData.ageGroup}s with ${formData.healthConditions.map(c => c.name).join(", ")}.${analysisResults.specialWarnings && analysisResults.specialWarnings.length > 0 ? ' ' + analysisResults.specialWarnings[0].description : ''}`;
    
    const splitSummary = doc.splitTextToSize(summary, 170);
    doc.text(splitSummary, 20, currentY);
    currentY += splitSummary.length * 5 + 8;
    
    // Ingredient analysis table
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('Ingredient Analysis:', 20, currentY);
    currentY += 8;
    
    const ingredientsTableData = analysisResults.ingredients.map(ingredient => [
      ingredient.name,
      ingredient.description.split(',')[0],
      ingredient.safety,
      ingredient.concerns || 'No concerns'
    ]);
    
    (doc as any).autoTable({
      startY: currentY,
      head: [['Ingredient', 'Function', 'Safety', 'Notes']],
      body: ingredientsTableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [76, 70, 229], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 50 }
      }
    });
    
    // Get the Y position after the table
    const tableEndY = (doc as any).autoTable.previous.finalY;
    currentY = tableEndY + 10;
    
    // Alternative products
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('Recommended Alternatives:', 20, currentY);
    currentY += 8;
    
    const alternativesTableData = analysisResults.alternatives.map(alt => [
      alt.name,
      alt.description,
      alt.rating,
      alt.benefits.join(', ')
    ]);
    
    (doc as any).autoTable({
      startY: currentY,
      head: [['Product', 'Description', 'Rating', 'Benefits']],
      body: alternativesTableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [76, 70, 229], textColor: [255, 255, 255] }
    });
    
    // Get the Y position after the table
    const alternativesEndY = (doc as any).autoTable.previous.finalY;
    currentY = alternativesEndY + 10;
    
    // Recommendations
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('Recommendations:', 20, currentY);
    currentY += 10;
    
    analysisResults.recommendations.forEach((rec, index) => {
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81); // gray-700
      const splitRec = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
      doc.text(splitRec, 20, currentY);
      currentY += splitRec.length * 6;
    });
    
    // Disclaimer
    const disclaimer = 'Disclaimer: This analysis is for informational purposes only and is not a substitute for professional medical advice. Always consult with a healthcare provider before making changes to your skincare routine.';
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    
    // Check if we need a new page for disclaimer
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(splitDisclaimer, 20, currentY);
    
    // Save the PDF
    const fileName = `${analysisResults.productName.replace(/[^a-z0-9]/gi, '_')}_Analysis.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
