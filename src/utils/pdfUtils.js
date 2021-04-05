import { jsPDF } from 'jspdf';

const setHeaderFont = (doc) => {
  doc.setFontSize(18);
  doc.setFont('times', null, 'bold');
  return doc;
};

const setSubHeaderFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('times', null, 'normal');
  return doc;
};

const generateSprintPDF = (sprint) => {
  let depth = 0;
  // Create PDF object and get dimensions for formatting
  const doc = new jsPDF();
  const pageHeight =
    doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth =
    doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

  // Print title
  doc.setFontSize(32);
  doc.setFont('times', null, 'bold');
  doc.text(
    `Sprint ${sprint.iteration} Overview`,
    pageWidth / 2,
    (depth += 30),
    {
      align: 'center',
    }
  );

  // Print logo
  const img = new Image();
  img.src = 'sprintcompass_logo.png';
  img.width = 417;
  img.height = 254;
  doc.addImage(
    img,
    'PNG',
    pageWidth / 2 - img.width * 0.04,
    (depth += 5),
    img.width * 0.08,
    img.height * 0.08
  );
  depth += img.height * 0.08;

  // Print each user story and each subtask in sprint
  sprint.userStories?.map((story) => {
    // Print story name
    setHeaderFont(doc).text(story.description, 20, (depth += 10));
    // Print subtasks, work done, and work left
    //story.subtasks.map()

    // Print totals for story
    setSubHeaderFont(doc).text(
      `Hours Worked: ${0}  Hours Remaining: ${0}`,
      pageWidth - 20,
      (depth += 8),
      {
        align: 'right',
      }
    );
  });
  // Download the pdf
  doc.save(`${sprint.projectId}Sprint${sprint.iteration}`);
};

export default generateSprintPDF;
