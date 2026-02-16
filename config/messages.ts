interface MessageTemplates {
    error: {
        notFound: string;
        alreadyExists: string;
        validationFailed: string;
        invalidId: string;
        failedToCreate: string;
        failedToUpdate: string;
        failedToDelete: string;
        failedToRetrieve: string;
    };
    success: {
        created: string;
        updated: string;
        deleted: string;
        retrieved: string;
    };
}

class MessageGenerator {
    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private isValidMessageType(type: string): type is keyof MessageTemplates {
        return ['error', 'success'].includes(type);
    }

    private getTemplateActions(type: keyof MessageTemplates): Record<string, (entity: string) => string> {
        const templates = {
            error: {
                notFound: (entity: string) => `${this.capitalize(entity)} not found`,
                alreadyExists: (entity: string) => `${this.capitalize(entity)} already exists`,
                validationFailed: (entity: string) => `${this.capitalize(entity)} validation failed`,
                invalidId: (entity: string) => `Invalid ${entity} ID`,
                failedToCreate: (entity: string) => `Failed to create ${entity}`,
                failedToUpdate: (entity: string) => `Failed to update ${entity}`,
                failedToDelete: (entity: string) => `Failed to delete ${entity}`,
                failedToRetrieve: (entity: string) => `Failed to retrieve ${entity}`
            },
            success: {
                created: (entity: string) => `${this.capitalize(entity)} successfully created`,
                updated: (entity: string) => `${this.capitalize(entity)} successfully updated`,
                deleted: (entity: string) => `${this.capitalize(entity)} successfully deleted`,
                retrieved: (entity: string) => `${this.capitalize(entity)} successfully retrieved`
            }
        };

        return templates[type];
    }

    generate(entity: string, type: string, action: string): string {
        // Validate message type
        if (!this.isValidMessageType(type)) {
            return 'Invalid message type';
        }

        const templates = this.getTemplateActions(type);
        const messageTemplate = templates[action];

        if (!messageTemplate) {
            return 'Invalid action type';
        }

        return messageTemplate(entity);
    }
}

const messageGenerator = new MessageGenerator();

export const getMessage = (path: string): string => {
    const [entity, type, action] = path.split('.');
    if (!entity || !type || !action) {
        return 'Invalid message path';
    }

    // Validate entity is a non-empty string with only letters
    if (!/^[a-zA-Z]+$/.test(entity)) {
        return 'Invalid entity type';
    }

    return messageGenerator.generate(entity, type, action);
};

// Example usage:
// getMessage('user.error.notFound')      -> "User not found"
// getMessage('product.success.created')   -> "Product successfully created"
// getMessage('order.error.alreadyExists') -> "Order already exists"
// getMessage('cart.success.updated')      -> "Cart successfully updated"
// getMessage('billing.error.notFound')    -> "Billing not found"
// getMessage('payment.success.created')   -> "Payment successfully created"
