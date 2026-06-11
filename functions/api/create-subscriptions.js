export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const {
      email,
      plan,
      user_id,
    } = body;

    const prices = {
      standard: 8000,
      premium: 15000,
      banner: 12000,
    };

    const amount = prices[plan];

    if (!amount) {
      return Response.json(
        {
          error: "Plan inválido",
        },
        {
          status: 400,
        }
      );
    }

    const response =
      await fetch(
        "https://api.mercadopago.com/preapproval",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${context.env.MP_ACCESS_TOKEN}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            reason:
              `Tus Comercios - ${plan}`,

            external_reference:
              user_id,

            payer_email:
              email,

            back_url:
              "https://tuscomercios.com.ar/success",

            auto_recurring: {
              frequency: 1,
              frequency_type: "months",
              transaction_amount:
                amount,
              currency_id:
                "ARS",
            },
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      return Response.json(
        data,
        {
          status: 500,
        }
      );
    }

    return Response.json({
      init_point:
        data.init_point,
    });

  } catch (error) {

    return Response.json(
      {
        error:
          error.message,
      },
      {
        status: 500,
      }
    );

  }
}