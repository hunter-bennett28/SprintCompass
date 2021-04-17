import { jsPDF } from 'jspdf';

/* Font setting methods */

// Bold larger font for headers
const setHeaderFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('Times', 'bold');
  return doc;
};

// Larger italic font for task names
const setTaskFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('Times', 'italic');
  return doc;
};

// Large normal font
const setLargeFont = (doc) => {
  doc.setFontSize(14);
  doc.setFont('Times', 'normal');
  return doc;
};

// Small normal font
const setSmallFont = (doc) => {
  doc.setFontSize(12);
  doc.setFont('Times', 'normal');
  return doc;
};

/* Helper Methods */

// Abbreviates a string to given length
const abbreviate = (string, length) =>
  string?.length > length ? `${string.substring(0, length - 3)}...` : string;

// PDF creation method that formats and calculates values for pdf, and starts user download
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

  let overallWorked = 0;
  let overallLeft = 0;
  let overallEstimated = 0;

  // Print each user story and each subtask in sprint
  sprint.userStories?.forEach((story) => {
    // Print Stories
    setTaskFont(doc).text(abbreviate(story.task, 63), leftIndent, (depth += 10));
    const userStoryDepth = depth;

    // Print subtasks
    let totalWorked = 0;
    let totalLeft = 0;
    let totalOriginalEstimate = 0;
    let unaccountedHours = 0;
    story.subtasks?.forEach((subtask) => {
      // Print subtask description
      setSmallFont(doc).text(abbreviate(subtask.task, 70), leftIndent + 5, (depth += 6));

      // Print subtask assignee
      const { firstName, lastName } =
        project.members.find((member) => member.email === subtask.assigned) || {};
      doc.text(`${firstName} ${lastName}`, assigneeIndent, depth, { align: 'center' });

      // Print original estimate
      doc.text(subtask.originalHoursEstimated?.toString(), originalEstimateIndent, depth, {
        align: 'center',
      });

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
      if (subtask.hoursEstimated === -1) unaccountedHours += subtask.originalEstimate;
      else totalLeft += subtask.hoursEstimated;
      totalOriginalEstimate += subtask.originalHoursEstimated;
    });

    // Calculate percentage complete
    let percentComplete = 100;
    if (totalLeft !== 0)
      percentComplete = Math.round(
        (totalWorked / (totalWorked + totalLeft + unaccountedHours)) * 100
      );
    else if (totalWorked === 0) percentComplete = 0;

    // Print calculated task totals
    setLargeFont(doc).text(`${percentComplete}%`, percentIndent, userStoryDepth, {
      align: 'center',
    });
    doc.text(totalOriginalEstimate.toString(), originalEstimateIndent, userStoryDepth, {
      align: 'center',
    });
    doc.text(totalWorked.toString(), workedIndent, userStoryDepth, { align: 'center' });
    doc.text(totalLeft.toString(), rightIndent, userStoryDepth, { align: 'center' });

    // Add to overall values
    overallEstimated += totalOriginalEstimate;
    overallLeft += totalLeft;
    overallWorked += totalWorked;
  });

  // Print Overall Totals
  setHeaderFont(doc).text('Total', assigneeIndent, (depth += 10), { align: 'center' });
  setLargeFont(doc).text(
    `${Math.round((overallWorked / (overallWorked + overallLeft || 1)) * 100)}%`,
    percentIndent,
    depth,
    {
      align: 'center',
    }
  );
  doc.text(overallEstimated.toString(), originalEstimateIndent, depth, {
    align: 'center',
  });
  doc.text(overallWorked.toString(), workedIndent, depth, { align: 'center' });
  doc.text(overallLeft.toString(), rightIndent, depth, { align: 'center' });

  // Download the pdf
  doc.save(`${project.projectName} Sprint ${sprint.iteration} Retrospective`);
};

export default generateSprintPDF;
