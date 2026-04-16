# Multi-Scan Medical Analyzer

## Overview

Multi-Scan Medical Analyzer is an AI-powered web application designed to analyze medical scan images such as X-rays, MRI, CT scans, and Ultrasound images. The system automatically detects the type of scan, identifies abnormalities, highlights affected regions, and provides simple explanations to assist users in understanding the results.

This project demonstrates the application of computer vision and artificial intelligence in healthcare for assisting preliminary diagnosis.

## Features

### Image Upload System

* Drag-and-drop upload functionality
* Supports JPG, PNG, and DICOM formats
* Displays preview of uploaded scan

### Automatic Scan Type Detection

* Identifies scan type (X-ray, MRI, CT, Ultrasound)
* Displays confidence score
* Allows manual override

### AI-Based Analysis

* Detects whether scan is Normal or Abnormal
* Provides confidence percentage
* Supports multi-condition detection:

  * Fracture
  * Tumor
  * Infection
  * Other abnormalities

### Multi-Label Results

* Displays multiple possible conditions with confidence scores

### Region Highlighting

* Highlights affected areas using heatmaps or overlays
* Toggle between:

  * Original image
  * Highlighted image
  * Overlay view

### Explainable AI

* Provides a “Why this result?” section
* Explains predictions using simple terms

### Image Quality Detection

* Detects low-quality or blurry images
* Displays warning messages

### Risk Level Indicator

* Classifies results into:

  * Low Risk
  * Medium Risk
  * High Risk

### AI Chat Assistant

* Allows users to ask questions about the uploaded scan
* Restricts responses strictly to scan-related queries

### Comparison Mode

* Compare two scans
* Highlights differences between them

### Report Generation

* Generates downloadable PDF report
* Includes:

  * Scan image
  * Scan type
  * Results
  * Confidence scores
  * Highlighted regions
  * Explanation
  * Risk level

## Technology Stack

* Frontend: React / Next.js
* Backend: Node.js / Python
* AI Models: Pre-trained deep learning models / APIs
* Libraries: OpenCV, TensorFlow / PyTorch
* Visualization: Matplotlib / Heatmaps

## System Workflow

1. User uploads a medical scan image
2. System preprocesses the image
3. AI model detects scan type
4. AI analyzes the image for abnormalities
5. System highlights affected regions
6. Explanation is generated
7. Results are displayed with confidence and risk level
8. User can download the report


## Installation and Setup

### Prerequisites

* Python 3.x
* Node.js
* Required libraries (install using pip/npm)

### Steps

1. Clone the repository
2. Install dependencies
3. Add API keys if required
4. Run backend server
5. Run frontend application

## Usage

* Upload a medical scan image
* View analysis results
* Check highlighted regions
* Read explanation
* Download report
* Ask AI about the scan

## Limitations

* Uses pre-trained models; accuracy depends on available models
* Not a replacement for professional medical diagnosis
* Limited condition coverage

## Future Enhancements

* Improve accuracy with specialized medical datasets
* Add real-time scan analysis
* Support 3D scan visualization
* Mobile application support
* Integration with hospital systems

## Disclaimer

This system is for educational purposes only and is not a substitute for professional medical diagnosis.

## Conclusion

The Multi-Scan Medical Analyzer showcases how artificial intelligence and computer vision can be used to analyze medical images and assist in early detection of abnormalities. The system provides visual insights and explanations, making it a useful tool for learning and research in AI-based healthcare applications.

