export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    console.log('✅ Forwarded webhook received at test endpoint');
    console.log(JSON.stringify(body, null, 2));
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (e) {
    console.error('Error in test function:', e);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: e.message })
    };
  }
}