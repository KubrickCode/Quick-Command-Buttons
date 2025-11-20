// Mock zod for Jest
const mockZodObject = () => ({
  optional: () => mockZodObject(),
  parse: (value) => value,
  safeParse: (value) => ({ success: true, data: value }),
});

const z = {
  string: () => mockZodObject(),
  boolean: () => mockZodObject(),
  array: () => mockZodObject(),
  object: () => mockZodObject(),
  lazy: () => mockZodObject(),
  ZodType: class ZodType {},
};

module.exports = { z };
