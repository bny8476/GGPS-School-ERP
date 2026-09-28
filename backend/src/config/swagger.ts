export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'GGPS School ERP API',
    version: '1.0.0',
    description: 'Production-ready REST API for GGPS School ERP with JWT Authentication, RBAC, Real-time Socket.IO, Student & Parent Management, Fees, and Admissions.',
    contact: {
      name: 'GGPS ERP Engineering',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Canonical API v1',
    },
    {
      url: '/api',
      description: 'Legacy Compatibility API',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token.',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          code: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      Student: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          studentId: { type: 'string', example: 'GGPS2026LKG001' },
          admissionNumber: { type: 'string', example: 'GGPS2026Admin001' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          grade: { type: 'string' },
          section: { type: 'string' },
          rollNumber: { type: 'string' },
          status: { type: 'string', enum: ['Active', 'Inactive', 'Suspended', 'Transferred', 'Graduated', 'Withdrawn'] },
        },
      },
      Admission: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          applicationNumber: { type: 'string' },
          childFirstName: { type: 'string' },
          childLastName: { type: 'string' },
          gradeAppliedFor: { type: 'string' },
          parentName: { type: 'string' },
          parentPhone: { type: 'string' },
          parentEmail: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Root Health Check',
        responses: {
          200: {
            description: 'API operational status',
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User Login',
        description: 'Authenticates staff or parent. Students cannot log in.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with token and profile' },
          401: { description: 'Invalid credentials or inactive account' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh Access Token',
        description: 'Rotates refresh token and returns a new 15-minute access token.',
        responses: {
          200: { description: 'New token issued' },
          401: { description: 'Invalid or revoked refresh token' },
        },
      },
    },
    '/students': {
      get: {
        summary: 'List Students',
        description: 'Get paginated students with search and filter. Parents only receive their linked children.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'grade', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated students list' },
        },
      },
      post: {
        summary: 'Create Student Record',
        description: 'Admin/Teacher creates student record with atomic studentId generation.',
        responses: {
          201: { description: 'Student created' },
        },
      },
    },
    '/students/{id}': {
      get: {
        summary: 'Get Student Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Student details' },
          403: { description: 'Access denied (Parent unauthorized for non-linked student)' },
        },
      },
    },
    '/students/{id}/promote': {
      post: {
        summary: 'Promote Student',
        description: 'Promotes student to next academic year and class without destroying historical enrollment records.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Student promoted successfully' },
        },
      },
    },
    '/admissions': {
      get: {
        summary: 'List Admissions',
        responses: {
          200: { description: 'List of admission applications' },
        },
      },
      post: {
        summary: 'Submit Admission Application',
        responses: {
          201: { description: 'Application submitted' },
        },
      },
    },
    '/admissions/{id}/approve': {
      post: {
        summary: 'Approve Admission and Convert to Student',
        description: 'Converts application to Student record, assigns enrollment, links parent, and dispatches welcome notification.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Admission approved and student created' },
        },
      },
    },
    '/finance/fees': {
      get: {
        summary: 'List Fee Invoices',
        responses: {
          200: { description: 'Fees list' },
        },
      },
    },
    '/finance/fees/{id}/pay': {
      post: {
        summary: 'Record Fee Payment',
        description: 'Processes payment idempotently, creates receipt number, and emits receipt notification.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Payment recorded and receipt generated' },
        },
      },
    },
    '/messages': {
      get: {
        summary: 'Get Chat Messages',
        parameters: [
          { name: 'recipientId', in: 'query', schema: { type: 'string' } },
          { name: 'room', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Messages list' },
        },
      },
      post: {
        summary: 'Send Real-time Message',
        responses: {
          201: { description: 'Message sent and socket dispatched' },
        },
      },
    },
  },
};
