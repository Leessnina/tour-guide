import html2canvas from 'html2canvas';

export async function exportToImage(
  elementId: string,
  filename = '美食攻略行程.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('未找到导出元素');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#fafaf9',
    logging: false,
  });

  // Create download link
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
