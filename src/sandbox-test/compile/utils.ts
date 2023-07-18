export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function render(template: string, context: object) {
  const required_vars = template.match(/\${(.*?)}/g)?.map((variable) => variable.slice(2, -1))
  check_required_variables(required_vars, context)
  return template.replace(/\${(.*?)}/g, (match, variable) => context[variable]);
}

export function check_required_variables(required_vars, context) {
  if (!required_vars || required_vars.length === 0) {
    return
  }
  for (const variable of required_vars) {
    if (!context.hasOwnProperty(variable)) {
      throw new Error(`Variable ${variable} not found in context`)
    }
  }
}

export function recursive_render_obj(obj: object, ctx: object) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => recursive_render_obj(item, ctx));
    } else {
      const processedObj: { [key: string]: any } = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          processedObj[key] = recursive_render_obj(obj[key], ctx);
        }
      }
      return processedObj;
    }
  } else {
    return render(obj, ctx); // 调用a()方法并替换原来的值
  }
}