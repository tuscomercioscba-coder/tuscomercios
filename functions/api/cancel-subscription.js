export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const { mp_subscription_id } = body;

    if (!mp_subscription_id) {
      return Response.json(
        { error: "Falta mp_subscription_id" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${mp_subscription_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${context.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: 500 });
    }

    return Response.json({
      success: true,
      data,
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}