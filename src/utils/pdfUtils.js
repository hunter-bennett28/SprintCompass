import { jsPDF } from 'jspdf';

const setHeaderFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('Times', 'bold');
  return doc;
};

const setTaskFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('Times', 'italic');
  return doc;
};

const setLargeFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('Times', 'normal');
  return doc;
};

const setSmallFont = (doc) => {
  doc.setFontSize(12);
  doc.setFont('Times', 'normal');
  return doc;
};

const abbreviate = (string, length) =>
  string?.length > length ? `${string.substring(0, length - 3)}...` : string;

const generateSprintPDF = (sprint) => {
  const project = JSON.parse(sessionStorage.getItem('project'));
  let depth = 0;

  // Create PDF object and get dimensions for formatting
  const doc = new jsPDF('landscape');

  // Create postiion consts using doc specs
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const leftIndent = 20;
  const rightIndent = pageWidth - 20;
  const workedIndent = pageWidth - 40;
  const originalEstimateIndent = pageWidth - 65;
  const percentIndent = pageWidth - 90;
  const assigneeIndent = pageWidth - 125;

  // Print logo
  const img = new Image();
  img.src = 'sprintcompass_logo.png';
  img.width = 417;
  img.height = 254;
  doc.addImage(img, 'PNG', leftIndent, (depth += 10), img.width * 0.04, img.height * 0.04);

  // Print title
  doc.setFontSize(24);
  doc.setFont('Times', 'bold');
  doc.text(`Project Team Name: ${project.teamName}`, leftIndent + img.width * 0.05, (depth += 8));

  // Print Sprint iteration
  setHeaderFont(doc).text(`Sprint ${sprint.iteration}`, rightIndent, depth, { align: 'right' });

  // Print column headers
  doc.text('User Stories/Subtasks', leftIndent + 47, (depth += 15));
  doc.text('Assignee', assigneeIndent, depth, { align: 'center' });
  doc.text('Percent\nComplete', percentIndent, depth - 3, { align: 'center' });
  doc.text('Original\nHours Est.', originalEstimateIndent, depth - 3, { align: 'center' });
  doc.text('Hours\nWorked', workedIndent, depth - 3, { align: 'center' });
  doc.text('Hours\nLeft', rightIndent, depth - 3, { align: 'center' });

  // Print each user story and each subtask in sprint
  sprint.userStories?.forEach((story) => {
    // Print Stories
    setTaskFont(doc).text(abbreviate(story.task, 63), 20, (depth += 10));
    const userStoryDepth = depth;

    // Print subtasks
    let totalWorked = 0;
    let totalLeft = 0;
    story.subtasks?.forEach((subtask) => {
      // Print subtask description
      setSmallFont(doc).text(abbreviate(subtask.task, 70), leftIndent + 5, (depth += 6));

      // Print subtask assignee
      doc.text(subtask.assigned, assigneeIndent, depth, { align: 'center' });

      // Print hours worked
      doc.text(subtask.hoursWorked?.toString(), workedIndent, depth, { align: 'center' });

      // Print hours left if given, or - if not
      doc.text(
        subtask.hoursEstimated > -1 ? subtask.hoursEstimated?.toString() : '-',
        rightIndent,
        depth,
        { align: 'center' }
      );

      // Sum values
      totalWorked += subtask.hoursWorked;
      totalLeft += subtask.hoursEstimated > -1 ? subtask.hoursWorked : 0; // only increment set values
      // TODO: sum original estimate and if == -1, set total left = estimate
    });
    let percentComplete = 100;
    if (totalLeft !== 0)
      percentComplete = Math.round((totalWorked / (totalWorked + totalLeft)) * 100);

    // Print calculated totals
    setLargeFont(doc).text(`${percentComplete}%`, percentIndent, userStoryDepth, {
      align: 'center',
    });
    doc.text(totalWorked.toString(), workedIndent, userStoryDepth, { align: 'center' });
    doc.text(totalLeft.toString(), rightIndent, userStoryDepth, { align: 'center' });
  });
  // Download the pdf
  doc.save(`${sprint.projectId}Sprint${sprint.iteration}`);
};

export default generateSprintPDF;
